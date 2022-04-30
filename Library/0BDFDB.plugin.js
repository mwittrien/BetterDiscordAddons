/**
 * @name BDFDB
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.3.4
 * @description Required Library for DevilBro's Plugins
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js
 */

module.exports = (_ => {
	const BdApi = window.BdApi;
	
	const config = {
		"info": {
			"name": "BDFDB",
			"author": "DevilBro",
			"version": "2.3.4",
			"description": "Required Library for DevilBro's Plugins"
		},
		"rawUrl": "https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js"
	};
	
	const Cache = {data: {}, modules: {}};
	
	var libraryInstance;
	var changeLogs = {};
	
	if (window.BDFDB_Global && window.BDFDB_Global.PluginUtils && typeof window.BDFDB_Global.PluginUtils.cleanUp == "function") {
		window.BDFDB_Global.PluginUtils.cleanUp(window.BDFDB_Global);
	}
	
	const BDFDB = {
		started: true
	};
	for (let key in config) key == "info" ? Object.assign(BDFDB, config[key]) : (BDFDB[key] = config[key]);
	
	const Internal = Object.assign({}, BDFDB, {
		patchPriority: 0,
		forceSyncData: true,
		settings: {},
		defaults: {
			general: {
				shareData: {
					value: true,
					onChange: _ => Cache.data = {}
				},
				showToasts: {
					value: true,
					isDisabled: data => data.nativeValue,
					hasNote: data => data.disabled && data.value
				},
				showSupportBadges: {
					value: true
				},
				useChromium: {
					value: false,
					isHidden: data => !Internal.LibraryRequires.electron || !Internal.LibraryRequires.electron.remote,
					getValue: data => !data.disabled
				}
			},
			choices: {
				toastPosition: {
					value: "right",
					items: "ToastPositions"
				}
			}
		},
	});
	for (let key in Internal.defaults) Internal.settings[key] = {};
	
	const LibraryConstants = {
		ToastIcons: {
			info: "INFO",
			danger: "CLOSE_CIRCLE",
			success: "CHECKMARK_CIRCLE",
			warning: "WARNING"
		},
		ToastPositions: {
			center: "toastscenter",
			left: "toastsleft",
			right: "toastsright"
		}
	};
	
	const PluginStores = {
		loaded: {},
		delayed: {
			loads: [],
			starts: []
		},
		updateData: {
			plugins: {},
			timeouts: [],
			downloaded: [],
			interval: null
		},
		patchQueues: {},
		chunkObserver: {},
		contextChunkObserver: {}
	};
	const Plugin = function(config) {
		return class Plugin {
			getName () {return config.info.name;}
			getAuthor () {return config.info.author;}
			getVersion () {return config.info.version;}
			getDescription () {return config.info.description;}
			load () {
				this.loaded = true;
				this.defaults = {};
				this.labels = {};
				if (window.BDFDB_Global.loading) {
					if (!PluginStores.delayed.loads.includes(this)) PluginStores.delayed.loads.push(this);
				}
				else {
					Object.assign(this, config.info, BDFDB.ObjectUtils.exclude(config, "info"));
					BDFDB.TimeUtils.suppress(_ => {
						PluginStores.loaded[config.info.name] = this;
						BDFDB.PluginUtils.load(this);
						if (typeof this.onLoad == "function") this.onLoad();
					}, "Failed to load Plugin!", config.info)();
				}
			}
			start () {
				if (!this.loaded) this.load();
				if (window.BDFDB_Global.loading) {
					if (!PluginStores.delayed.starts.includes(this)) PluginStores.delayed.starts.push(this);
				}
				else {
					if (this.started) return;
					this.started = true;
					BDFDB.TimeUtils.suppress(_ => {
						BDFDB.PluginUtils.init(this);
						if (typeof this.onStart == "function") this.onStart();
					}, "Failed to start Plugin!", config.info)();
					delete this.stopping;
				}
			}
			stop () {
				if (window.BDFDB_Global.loading) {
					if (PluginStores.delayed.starts.includes(this)) PluginStores.delayed.starts.splice(PluginStores.delayed.starts.indexOf(this), 1);
				}
				else {
					if (this.stopping) return;
					this.stopping = true;
					BDFDB.TimeUtils.timeout(_ => {delete this.stopping;});
					
					BDFDB.TimeUtils.suppress(_ => {
						if (typeof this.onStop == "function") this.onStop();
						BDFDB.PluginUtils.clear(this);
					}, "Failed to stop Plugin!", config.info)();

					delete this.started;
				}
			}
		};
	};

	BDFDB.LogUtils = {};
	Internal.console = function (type, config = {}) {
		if (!console[type]) return;
		let name, version;
		if (typeof config.name == "string" && config.name) {
			name = config.name;
			version = typeof config.version == "string" ? config.version : "";
		}
		else {
			name = BDFDB.name;
			version = BDFDB.version;
		}
		console[type](...[[name && `%c[${name}]`, version && `%c(v${version})`].filter(n => n).join(" "), name && "color: #3a71c1; font-weight: 700;", version && "color: #666; font-weight: 600; font-size: 11px;", [config.strings].flat(10).filter(n => n).join(" ").trim()].filter(n => n));
	};
	BDFDB.LogUtils.log = function (strings, config = {}) {
		Internal.console("log", Object.assign({}, config, {name: typeof config == "string" ? config : config.name, strings}));
	};
	BDFDB.LogUtils.warn = function (strings, config = {}) {
		Internal.console("warn", Object.assign({}, config, {name: typeof config == "string" ? config : config.name, strings}));
	};
	BDFDB.LogUtils.error = function (strings, config = {}) {
		Internal.console("error", Object.assign({}, config, {name: typeof config == "string" ? config : config.name, strings: ["Fatal Error:", strings]}));
	};

	BDFDB.TimeUtils = {};
	BDFDB.TimeUtils.interval = function (callback, delay, ...args) {
		if (typeof callback != "function" || typeof delay != "number" || delay < 1) return;
		else {
			let count = 0, interval = setInterval(_ => BDFDB.TimeUtils.suppress(callback, "Interval")(...[interval, count++, args].flat()), delay);
			return interval;
		}
	};
	BDFDB.TimeUtils.timeout = function (callback, delay, ...args) {
		delay = parseFloat(delay);
		if (typeof callback != "function") return;
		if (isNaN(delay) || typeof delay != "number" || delay < 1) {
			let immediate = setImmediate(_ => BDFDB.TimeUtils.suppress(callback, "Immediate")(...[immediate, args].flat()));
			return immediate;
		}
		else {
			let start, paused = true, timeout = {
				pause: _ => {
					if (paused) return;
					paused = true;
					BDFDB.TimeUtils.clear(timeout.timer);
					delay -= performance.now() - start;
				},
				resume: _ => {
					if (!paused) return;
					paused = false;
					start = performance.now();
					timeout.timer = setTimeout(_ => BDFDB.TimeUtils.suppress(callback, "Timeout")(...[timeout, args].flat()), delay)
				}
			};
			timeout.resume();
			return timeout;
		}
	};
	BDFDB.TimeUtils.clear = function (...timeObjects) {
		for (let t of timeObjects.flat(10).filter(n => n)) {
			t = t.timer != undefined ? t.timer : t;
			if (typeof t == "number") {
				clearInterval(t);
				clearTimeout(t);
			}
			else if (typeof t == "object") clearImmediate(t);
		}
	};
	BDFDB.TimeUtils.suppress = function (callback, strings, config) {return function (...args) {
		try {return callback(...args);}
		catch (err) {BDFDB.LogUtils.error([strings, err], config);}
	}};

	BDFDB.LogUtils.log("Loading Library");

	BDFDB.sameProto = function (a, b) {
		if (a != null && typeof a == "object") return a.constructor && a.constructor.prototype && typeof a.constructor.prototype.isPrototypeOf == "function" && a.constructor.prototype.isPrototypeOf(b);
		else return typeof a == typeof b;
	};
	BDFDB.equals = function (mainA, mainB, sorted) {
		let i = -1;
		if (sorted === undefined || typeof sorted !== "boolean") sorted = false;
		return equal(mainA, mainB);
		function equal(a, b) {
			i++;
			let result = true;
			if (i > 1000) result = null;
			else {
				if (typeof a !== typeof b) result = false;
				else if (typeof a == "function") result = a.toString() == b.toString();
				else if (typeof a === "undefined") result = true;
				else if (typeof a === "symbol") result = true;
				else if (typeof a === "boolean") result = a == b;
				else if (typeof a === "string") result = a == b;
				else if (typeof a === "number") {
					if (isNaN(a) || isNaN(b)) result = isNaN(a) == isNaN(b);
					else result = a == b;
				}
				else if (!a && !b) result = true;
				else if (!a || !b) result = false;
				else if (typeof a === "object") {
					let keysA = Object.getOwnPropertyNames(a);
					let keysB = Object.getOwnPropertyNames(b);
					if (keysA.length !== keysB.length) result = false;
					else for (let j = 0; result === true && j < keysA.length; j++) {
						if (sorted) result = equal(a[keysA[j]], b[keysB[j]]);
						else result = equal(a[keysA[j]], b[keysA[j]]);
					}
				}
			}
			i--;
			return result;
		}
	};

	BDFDB.ObjectUtils = {};
	BDFDB.ObjectUtils.is = function (obj) {
		return obj && !Array.isArray(obj) && !Set.prototype.isPrototypeOf(obj) && (typeof obj == "function" || typeof obj == "object");
	};
	BDFDB.ObjectUtils.get = function (nodeOrObj, valuePath) {
		if (!nodeOrObj || !valuePath) return null;
		let obj = Node.prototype.isPrototypeOf(nodeOrObj) ? BDFDB.ReactUtils.getInstance(nodeOrObj) : nodeOrObj;
		if (!BDFDB.ObjectUtils.is(obj)) return null;
		let found = obj;
		for (const value of valuePath.split(".").filter(n => n)) {
			if (!found) return null;
			found = found[value];
		}
		return found;
	};
	BDFDB.ObjectUtils.extract = function (obj, ...keys) {
		let newObj = {};
		if (BDFDB.ObjectUtils.is(obj)) for (let key of keys.flat(10).filter(n => n)) if (obj[key] != null) newObj[key] = obj[key];
		return newObj;
	};
	BDFDB.ObjectUtils.exclude = function (obj, ...keys) {
		let newObj = Object.assign({}, obj);
		BDFDB.ObjectUtils.delete(newObj, ...keys)
		return newObj;
	};
	BDFDB.ObjectUtils.delete = function (obj, ...keys) {
		if (BDFDB.ObjectUtils.is(obj)) for (let key of keys.flat(10).filter(n => n)) delete obj[key];
	};
	BDFDB.ObjectUtils.sort = function (obj, sort, except) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		let newObj = {};
		if (sort === undefined || !sort) for (let key of Object.keys(obj).sort()) newObj[key] = obj[key];
		else {
			let values = [];
			for (let key in obj) values.push(obj[key]);
			values = BDFDB.ArrayUtils.keySort(values, sort, except);
			for (let value of values) for (let key in obj) if (BDFDB.equals(value, obj[key])) {
				newObj[key] = value;
				break;
			}
		}
		return newObj;
	};
	BDFDB.ObjectUtils.group = function (obj, key) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		if (typeof key != "string") return obj;
		return Object.entries(obj).reduce((newObj, objPair) => {
			if (!newObj[objPair[1][key]]) newObj[objPair[1][key]] = {};
			newObj[objPair[1][key]][objPair[0]] = objPair[1];
			return newObj;
		}, {});
	};
	BDFDB.ObjectUtils.reverse = function (obj, sort) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		let newObj = {};
		for (let key of (sort === undefined || !sort) ? Object.keys(obj).reverse() : Object.keys(obj).sort().reverse()) newObj[key] = obj[key];
		return newObj;
	};
	BDFDB.ObjectUtils.filter = function (obj, filter, byKey = false) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		if (typeof filter != "function") return obj;
		return Object.keys(obj).filter(key => filter(byKey ? key : obj[key])).reduce((newObj, key) => (newObj[key] = obj[key], newObj), {});
	};
	BDFDB.ObjectUtils.push = function (obj, value) {
		if (BDFDB.ObjectUtils.is(obj)) obj[Object.keys(obj).length] = value;
	};
	BDFDB.ObjectUtils.pop = function (obj, value) {
		if (BDFDB.ObjectUtils.is(obj)) {
			let keys = Object.keys(obj);
			if (!keys.length) return;
			let value = obj[keys[keys.length-1]];
			delete obj[keys[keys.length-1]];
			return value;
		}
	};
	BDFDB.ObjectUtils.map = function (obj, mapFunc) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		if (typeof mapFunc != "string" && typeof mapFunc != "function") return obj;
		let newObj = {};
		for (let key in obj) if (BDFDB.ObjectUtils.is(obj[key])) newObj[key] = typeof mapFunc == "string" ? obj[key][mapFunc] : mapFunc(obj[key], key);
		return newObj;
	};
	BDFDB.ObjectUtils.toArray = function (obj) {
		if (!BDFDB.ObjectUtils.is(obj)) return [];
		return Object.entries(obj).map(n => n[1]);
	};
	BDFDB.ObjectUtils.deepAssign = function (obj, ...objs) {
		if (!objs.length) return obj;
		let nextObj = objs.shift();
		if (BDFDB.ObjectUtils.is(obj) && BDFDB.ObjectUtils.is(nextObj)) {
			for (let key in nextObj) {
				if (BDFDB.ObjectUtils.is(nextObj[key])) {
					if (!obj[key]) Object.assign(obj, {[key]:{}});
					BDFDB.ObjectUtils.deepAssign(obj[key], nextObj[key]);
				}
				else Object.assign(obj, {[key]:nextObj[key]});
			}
		}
		return BDFDB.ObjectUtils.deepAssign(obj, ...objs);
	};
	BDFDB.ObjectUtils.isEmpty = function (obj) {
		return !BDFDB.ObjectUtils.is(obj) || Object.getOwnPropertyNames(obj).length == 0;
	};
	BDFDB.ObjectUtils.mirror = function (obj) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		let newObj = Object.assign({}, obj);
		for (let key in newObj) if (newObj[newObj[key]] == undefined && (typeof key == "number" || typeof key == "string")) newObj[newObj[key]] = key;
		return newObj;
	};

	BDFDB.ArrayUtils = {};
	BDFDB.ArrayUtils.is = function (array) {
		return array && Array.isArray(array);
	};
	BDFDB.ArrayUtils.sum = function (array) {
		return Array.isArray(array) ? array.reduce((total, num) => total + Math.round(num), 0) : 0;
	};
	BDFDB.ArrayUtils.keySort = function (array, key, except) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		if (key == null) return array;
		if (except === undefined) except = null;
		return array.sort((x, y) => {
			let xValue = x[key], yValue = y[key];
			if (xValue !== except) return xValue < yValue ? -1 : xValue > yValue ? 1 : 0;
		});
	};
	BDFDB.ArrayUtils.numSort = function (array) {
		return array.sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
	};
	BDFDB.ArrayUtils.includes = function (array, ...values) {
		if (!BDFDB.ArrayUtils.is(array)) return null;
		if (!array.length) return false;
		let all = values.pop();
		if (typeof all != "boolean") {
			values.push(all);
			all = true;
		}
		if (!values.length) return false;
		let contained = undefined;
		for (let v of values) {
			if (contained === undefined) contained = all;
			if (all && !array.includes(v)) contained = false;
			if (!all && array.includes(v)) contained = true;
		}
		return contained;
	};
	BDFDB.ArrayUtils.remove = function (array, value, all = false) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		if (!array.includes(value)) return array;
		if (!all) array.splice(array.indexOf(value), 1);
		else while (array.indexOf(value) > -1) array.splice(array.indexOf(value), 1);
		return array;
	};
	BDFDB.ArrayUtils.getAllIndexes = function (array, value) {
		if (!BDFDB.ArrayUtils.is(array) && typeof array != "string") return [];
		var indexes = [], index = -1;
		while ((index = array.indexOf(value, index + 1)) !== -1) indexes.push(index);
		return indexes;
	};
	BDFDB.ArrayUtils.removeCopies = function (array) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		return [...new Set(array)];
	};

	BDFDB.BDUtils = {};
	BDFDB.BDUtils.getPluginsFolder = function () {
		if (BdApi && BdApi.Plugins && BdApi.Plugins.folder && typeof BdApi.Plugins.folder == "string") return BdApi.Plugins.folder;
		else if (Internal.LibraryRequires.process.env.BETTERDISCORD_DATA_PATH) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.BETTERDISCORD_DATA_PATH, "plugins/");
		else if (Internal.LibraryRequires.process.env.injDir) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.injDir, "plugins/");
		else switch (Internal.LibraryRequires.process.platform) {
			case "win32":
				return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.appdata, "BetterDiscord/plugins/");
			case "darwin":
				return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.HOME, "Library/Preferences/BetterDiscord/plugins/");
			default:
				if (Internal.LibraryRequires.process.env.XDG_CONFIG_HOME) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.XDG_CONFIG_HOME, "BetterDiscord/plugins/");
				else if (Internal.LibraryRequires.process.env.HOME) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.HOME, ".config/BetterDiscord/plugins/");
				else return "";
			}
	};
	BDFDB.BDUtils.getThemesFolder = function () {
		if (BdApi && BdApi.Themes && BdApi.Themes.folder && typeof BdApi.Themes.folder == "string") return BdApi.Themes.folder;
		else if (Internal.LibraryRequires.process.env.BETTERDISCORD_DATA_PATH) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.BETTERDISCORD_DATA_PATH, "themes/");
		else if (Internal.LibraryRequires.process.env.injDir) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.injDir, "plugins/");
		else switch (Internal.LibraryRequires.process.platform) {
			case "win32": 
				return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.appdata, "BetterDiscord/themes/");
			case "darwin": 
				return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.HOME, "Library/Preferences/BetterDiscord/themes/");
			default:
				if (Internal.LibraryRequires.process.env.XDG_CONFIG_HOME) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.XDG_CONFIG_HOME, "BetterDiscord/themes/");
				else if (Internal.LibraryRequires.process.env.HOME) return Internal.LibraryRequires.path.resolve(Internal.LibraryRequires.process.env.HOME, ".config/BetterDiscord/themes/");
				else return "";
			}
	};
	BDFDB.BDUtils.isPluginEnabled = function (pluginName) {
		if (!BdApi) return null;
		else if (BdApi.Plugins && typeof BdApi.Plugins.isEnabled == "function") return BdApi.Plugins.isEnabled(pluginName);
		else if (typeof BdApi.isPluginEnabled == "function") return BdApi.isPluginEnabled(pluginName);
	};
	BDFDB.BDUtils.reloadPlugin = function (pluginName) {
		if (!BdApi) return;
		else if (BdApi.Plugins && typeof BdApi.Plugins.reload == "function") BdApi.Plugins.reload(pluginName);
		else if (window.pluginModule) window.pluginModule.reloadPlugin(pluginName);
	};
	BDFDB.BDUtils.enablePlugin = function (pluginName) {
		if (!BdApi) return;
		else if (BdApi.Plugins && typeof BdApi.Plugins.enable == "function") BdApi.Plugins.enable(pluginName);
		else if (window.pluginModule) window.pluginModule.startPlugin(pluginName);
	};
	BDFDB.BDUtils.disablePlugin = function (pluginName) {
		if (!BdApi) return;
		else if (BdApi.Plugins && typeof BdApi.Plugins.disable == "function") BdApi.Plugins.disable(pluginName);
		else if (window.pluginModule) window.pluginModule.stopPlugin(pluginName);
	};
	BDFDB.BDUtils.getPlugin = function (pluginName, hasToBeEnabled = false, overHead = false) {
		if (BdApi && !hasToBeEnabled || BDFDB.BDUtils.isPluginEnabled(pluginName)) {	
			if (BdApi.Plugins && typeof BdApi.Plugins.get == "function") {
				let plugin = BdApi.Plugins.get(pluginName);
				if (!plugin) return null;
				if (overHead) return plugin.filename && plugin.exports && plugin.instance ? plugin : {filename: Internal.LibraryRequires.fs.existsSync(Internal.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), `${pluginName}.plugin.js`)) ? `${pluginName}.plugin.js` : null, id: pluginName, name: pluginName, plugin: plugin};
				else return plugin.filename && plugin.exports && plugin.instance ? plugin.instance : plugin;
			}
			else if (window.bdplugins) overHead ? window.bdplugins[pluginName] : (window.bdplugins[pluginName] || {}).plugin;
		}
		return null;
	};
	BDFDB.BDUtils.isThemeEnabled = function (themeName) {
		if (!BdApi) return null;
		else if (BdApi.Themes && typeof BdApi.Themes.isEnabled == "function") return BdApi.Themes.isEnabled(themeName);
		else if (typeof BdApi.isThemeEnabled == "function") return BdApi.isThemeEnabled(themeName);
	};
	BDFDB.BDUtils.enableTheme = function (themeName) {
		if (!BdApi) return;
		else if (BdApi.Themes && typeof BdApi.Themes.enable == "function") BdApi.Themes.enable(themeName);
		else if (window.themeModule) window.themeModule.enableTheme(themeName);
	};
	BDFDB.BDUtils.disableTheme = function (themeName) {
		if (!BdApi) return;
		else if (BdApi.Themes && typeof BdApi.Themes.disable == "function") BdApi.Themes.disable(themeName);
		else if (window.themeModule) window.themeModule.disableTheme(themeName);
	};
	BDFDB.BDUtils.getTheme = function (themeName, hasToBeEnabled = false) {
		if (BdApi && !hasToBeEnabled || BDFDB.BDUtils.isThemeEnabled(themeName)) {
			if (BdApi.Themes && typeof BdApi.Themes.get == "function") return BdApi.Themes.get(themeName);
			else if (window.bdthemes) window.bdthemes[themeName];
		}
		return null;
	};
	BDFDB.BDUtils.settingsIds = {
		automaticLoading: "settings.addons.autoReload",
		coloredText: "settings.appearance.coloredText",
		normalizedClasses: "settings.general.classNormalizer",
		showToasts: "settings.general.showToasts"
	};
	BDFDB.BDUtils.toggleSettings = function (key, state) {
		if (BdApi && typeof key == "string") {
			let path = key.split(".");
			let currentState = BDFDB.BDUtils.getSettings(key);
			if (state === true) {
				if (currentState === false && typeof BdApi.enableSetting == "function") BdApi.enableSetting(...path);
			}
			else if (state === false) {
				if (currentState === true && typeof BdApi.disableSetting == "function") BdApi.disableSetting(...path);
			}
			else if (currentState === true || currentState === false) BDFDB.BDUtils.toggleSettings(key, !currentState);
		}
	};
	BDFDB.BDUtils.getSettings = function (key) {
		if (!BdApi) return {};
		if (typeof key == "string") return typeof BdApi.isSettingEnabled == "function" && BdApi.isSettingEnabled(...key.split("."));
		else return BDFDB.ArrayUtils.is(BdApi.settings) ? BdApi.settings.map(n => n.settings.map(m => m.settings.map(l => ({id: [n.id, m.id, l.id].join("."), value: l.value})))).flat(10).reduce((newObj, setting) => (newObj[setting.id] = setting.value, newObj), {}) : {};
	};
	BDFDB.BDUtils.getSettingsProperty = function (property, key) {
		if (!BdApi || !BDFDB.ArrayUtils.is(BdApi.settings)) return key ? "" : {};
		else {
			let settingsMap = BdApi.settings.map(n => n.settings.map(m => m.settings.map(l => ({id: [n.id, m.id, l.id].join("."), value: l[property]})))).flat(10).reduce((newObj, setting) => (newObj[setting.id] = setting.value, newObj), {});
			return key ? (settingsMap[key] != null ? settingsMap[key] : "") : "";
		}
	};
	
	
	BDFDB.PluginUtils = {};
	BDFDB.PluginUtils.buildPlugin = function (config) {
		return [Plugin(config), BDFDB];
	};
	BDFDB.PluginUtils.load = function (plugin) {
		if (!PluginStores.updateData.timeouts.includes(plugin.name)) {
			PluginStores.updateData.timeouts.push(plugin.name);
			const url = Internal.getPluginURL(plugin);

			PluginStores.updateData.plugins[url] = {name: plugin.name, raw: url, version: plugin.version};
			
			BDFDB.PluginUtils.checkUpdate(plugin.name, url);
			
			if (!PluginStores.updateData.interval) PluginStores.updateData.interval = BDFDB.TimeUtils.interval(_ => {
				BDFDB.PluginUtils.checkAllUpdates();
			}, 1000*60*60*4);
			
			BDFDB.TimeUtils.timeout(_ => BDFDB.ArrayUtils.remove(PluginStores.updateData.timeouts, plugin.name, true), 30000);
		}
	};
	BDFDB.PluginUtils.init = function (plugin) {
		BDFDB.PluginUtils.load(plugin);
		
		plugin.settings = BDFDB.DataUtils.get(plugin);
		
		BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", ""), plugin);
		if (Internal.settings.general.showToasts && !BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.showToasts)) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", `${plugin.name} v${plugin.version}`), {
			disableInteractions: true,
			barColor: BDFDB.DiscordConstants.Colors.STATUS_GREEN
		});
		
		if (plugin.css) BDFDB.DOMUtils.appendLocalStyle(plugin.name, plugin.css);
		
		Internal.patchPlugin(plugin);
		Internal.addQueuePatches(plugin);
		Internal.addContextChunkObservers(plugin);

		BDFDB.PluginUtils.translate(plugin);

		BDFDB.PluginUtils.checkChangeLog(plugin);
	};
	BDFDB.PluginUtils.clear = function (plugin) {
		BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_stopped", ""), plugin);
		if (Internal.settings.general.showToasts && !BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.showToasts)) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_stopped", `${plugin.name} v${plugin.version}`), {
			disableInteractions: true,
			barColor: BDFDB.DiscordConstants.Colors.STATUS_RED
		});
		
		const url = Internal.getPluginURL(plugin);

		BDFDB.PluginUtils.cleanUp(plugin);
		
		for (const type in PluginStores.patchQueues) BDFDB.ArrayUtils.remove(PluginStores.patchQueues[type].query, plugin, true);
		for (const type in PluginStores.chunkObserver) BDFDB.ArrayUtils.remove(PluginStores.chunkObserver[type].query, plugin, true);
		for (const type in PluginStores.contextChunkObserver) BDFDB.ArrayUtils.remove(PluginStores.contextChunkObserver[type].query, plugin, true);
		
		for (const modal of document.querySelectorAll(`.${plugin.name}-modal, .${plugin.name.toLowerCase()}-modal, .${plugin.name}-settingsmodal, .${plugin.name.toLowerCase()}-settingsmodal`)) {
			const closeButton = modal.querySelector(BDFDB.dotCN.modalclose);
			if (closeButton) closeButton.click();
		}
		
		delete Cache.data[plugin.name]
		delete PluginStores.updateData.plugins[url];
	};
	BDFDB.PluginUtils.translate = function (plugin) {
		if (typeof plugin.setLabelsByLanguage == "function" || typeof plugin.changeLanguageStrings == "function") {
			const translate = _ => {
				if (typeof plugin.setLabelsByLanguage == "function") plugin.labels = plugin.setLabelsByLanguage();
				if (typeof plugin.changeLanguageStrings == "function") plugin.changeLanguageStrings();
			};
			if (Internal.LibraryModules.LanguageStore.chosenLocale || Internal.LibraryModules.LanguageStore._chosenLocale || BDFDB.DicordUtils.getSettings("locale")) translate();
			else BDFDB.TimeUtils.interval(interval => {
				if (Internal.LibraryModules.LanguageStore.chosenLocale || Internal.LibraryModules.LanguageStore._chosenLocale || BDFDB.DicordUtils.getSettings("locale")) {
					BDFDB.TimeUtils.clear(interval);
					translate();
				}
			}, 100);
		}
	};
	BDFDB.PluginUtils.cleanUp = function (plugin) {
		BDFDB.TimeUtils.suppress(_ => {
			if (!BDFDB.ObjectUtils.is(plugin)) return;
			if (plugin == window.BDFDB_Global) {
				if (Internal.removeChunkObserver) Internal.removeChunkObserver();
				let updateNotice = BDFDB.dotCN && document.querySelector(BDFDB.dotCN.noticeupdate);
				if (updateNotice) updateNotice.close();
				BDFDB.TimeUtils.clear(PluginStores && PluginStores.updateData && PluginStores.updateData.interval);
				delete window.BDFDB_Global.loaded;
				if (PluginStores) BDFDB.TimeUtils.interval((interval, count) => {
					if (count > 60 || window.BDFDB_Global.loaded) BDFDB.TimeUtils.clear(interval);
					if (window.BDFDB_Global.loaded) for (let pluginName in BDFDB.ObjectUtils.sort(PluginStores.loaded)) BDFDB.TimeUtils.timeout(_ => {
						if (PluginStores.loaded[pluginName].started) BDFDB.BDUtils.reloadPlugin(pluginName);
					});
				}, 1000);
			}
			if (BDFDB.DOMUtils && BDFDB.DOMUtils.removeLocalStyle) BDFDB.DOMUtils.removeLocalStyle(plugin.name);
			if (BDFDB.ListenerUtils && BDFDB.ListenerUtils.remove) BDFDB.ListenerUtils.remove(plugin);
			if (BDFDB.ListenerUtils && BDFDB.ListenerUtils.removeGlobal) BDFDB.ListenerUtils.removeGlobal(plugin);
			if (BDFDB.StoreChangeUtils && BDFDB.StoreChangeUtils.remove) BDFDB.StoreChangeUtils.remove(plugin);
			if (BDFDB.ObserverUtils && BDFDB.ObserverUtils.disconnect) BDFDB.ObserverUtils.disconnect(plugin);
			if (BDFDB.PatchUtils && BDFDB.PatchUtils.unpatch) BDFDB.PatchUtils.unpatch(plugin);
			if (BDFDB.WindowUtils && BDFDB.WindowUtils.closeAll) BDFDB.WindowUtils.closeAll(plugin);
			if (BDFDB.WindowUtils && BDFDB.WindowUtils.removeListener) BDFDB.WindowUtils.removeListener(plugin);
		}, "Failed to clean up Plugin!", plugin)();
	};
	BDFDB.PluginUtils.checkUpdate = function (pluginName, url) {
		if (pluginName && url && PluginStores.updateData.plugins[url]) return new Promise(callback => {
			Internal.LibraryRequires.request(url, (error, response, body) => {
				if (error || !PluginStores.updateData.plugins[url]) return callback(null);
				let newName = (body.match(/"name"\s*:\s*"([^"]+)"/) || [])[1] || pluginName;
				let newVersion = (body.match(/@version ([0-9]+\.[0-9]+\.[0-9]+)|['"]([0-9]+\.[0-9]+\.[0-9]+)['"]/i) || []).filter(n => n)[1];
				if (!newVersion) return callback(null);
				if (pluginName == newName && BDFDB.NumberUtils.getVersionDifference(newVersion, PluginStores.updateData.plugins[url].version) > 0.2) {
					BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_force_updated", pluginName), {
						type: "warning",
						disableInteractions: true
					});
					BDFDB.PluginUtils.downloadUpdate(pluginName, url);
					return callback(2);
				}
				else if (BDFDB.NumberUtils.compareVersions(newVersion, PluginStores.updateData.plugins[url].version)) {
					if (PluginStores.updateData.plugins[url]) PluginStores.updateData.plugins[url].outdated = true;
					BDFDB.PluginUtils.showUpdateNotice(pluginName, url);
					return callback(1);
				}
				else {
					BDFDB.PluginUtils.removeUpdateNotice(pluginName);
					return callback(0);
				}
			});
		});
		return new Promise(callback => callback(null));
	};
	BDFDB.PluginUtils.checkAllUpdates = function () {
		return new Promise(callback => {
			let finished = 0, amount = 0;
			for (let url in PluginStores.updateData.plugins) {
				let plugin = PluginStores.updateData.plugins[url];
				if (plugin) BDFDB.PluginUtils.checkUpdate(plugin.name, plugin.raw).then(state => {
					finished++;
					if (state == 1) amount++;
					if (finished >= Object.keys(PluginStores.updateData.plugins).length) callback(amount);
				});
			}
		});
	};
	BDFDB.PluginUtils.hasUpdateCheck = function (url) {
		if (!url || typeof url != "string") return false;
		let updateStore = Object.assign({}, window.PluginUpdates && window.PluginUpdates.plugins, PluginStores.updateData.plugins);
		if (updateStore[url]) return true;
		else {
			let temp = url.replace("//raw.githubusercontent.com", "//").split("/");
			let gitName = temp.splice(3, 1);
			temp.splice(4, 1);
			temp.splice(2, 1, gitName + ".github.io");
			let pagesUrl = temp.join("/");
			return !!updateStore[pagesUrl];
		}
	};
	BDFDB.PluginUtils.showUpdateNotice = function (pluginName, url) {
		if (!pluginName || !url) return;
		let updateNotice = document.querySelector(BDFDB.dotCN.noticeupdate);
		if (!updateNotice) {
			let vanishObserver = new MutationObserver(changes => {
				if (!document.contains(updateNotice)) {
					if (updateNotice.querySelector(BDFDB.dotCN.noticeupdateentry)) {
						let layers = document.querySelector(BDFDB.dotCN.layers) || document.querySelector(BDFDB.dotCN.appmount);
						if (layers) layers.parentElement.insertBefore(updateNotice, layers);
					}
					else vanishObserver.disconnect();
				}
				else if (document.contains(updateNotice) && !updateNotice.querySelector(BDFDB.dotCNC.noticeupdateentry + BDFDB.dotCN.noticebutton)) vanishObserver.disconnect();
			});
			vanishObserver.observe(document.body, {childList: true, subtree: true});
			updateNotice = BDFDB.NotificationUtils.notice(`${BDFDB.LanguageUtils.LibraryStrings.update_notice_update}&nbsp;&nbsp;&nbsp;&nbsp;<div class="${BDFDB.disCN.noticeupdateentries}"></div>`, {
				type: "info",
				className: BDFDB.disCN.noticeupdate,
				html: true,
				forceStyle: true,
				customIcon: `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M 15.46875 0.859375 C 15.772992 1.030675 16.059675 1.2229406 16.326172 1.4316406 C 17.134815 2.0640406 17.768634 2.8677594 18.208984 3.8183594 C 18.665347 4.8050594 18.913286 5.9512625 18.945312 7.2265625 L 18.945312 7.2421875 L 18.945312 7.2597656 L 18.945312 16.753906 L 18.945312 16.769531 L 18.945312 16.785156 C 18.914433 18.060356 18.666491 19.206759 18.208984 20.193359 C 17.768634 21.144059 17.135961 21.947578 16.326172 22.580078 C 16.06768 22.782278 15.790044 22.967366 15.496094 23.134766 L 16.326172 23.134766 C 20.285895 23.158766 24 20.930212 24 15.820312 L 24 8.3535156 C 24.021728 3.1431156 20.305428 0.86132812 16.345703 0.86132812 L 15.46875 0.859375 z M 0 0.8671875 L 0 10.064453 L 4.4492188 15.191406 L 4.4492188 5.4394531 L 8.4394531 5.4394531 C 11.753741 5.4394531 11.753741 9.8828125 8.4394531 9.8828125 L 7.0234375 9.8828125 L 7.0234375 14.126953 L 8.4394531 14.126953 C 11.753741 14.126953 11.753741 18.568359 8.4394531 18.568359 L 0 18.568359 L 0 23.138672 L 8.3457031 23.138672 C 12.647637 23.138672 15.987145 21.3021 16.105469 16.75 C 16.105469 14.6555 15.567688 13.090453 14.621094 12.001953 C 15.567688 10.914853 16.105469 9.3502594 16.105469 7.2558594 C 15.988351 2.7036594 12.648845 0.8671875 8.3457031 0.8671875 L 0 0.8671875 z"/></svg>`,
				buttons: !BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.automaticLoading) && [{
					className: BDFDB.disCN.noticeupdatebuttonreload,
					contents: BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD,
					onClick: _ => location.reload(),
					onMouseEnter: _ => {
						if (PluginStores.updateData.downloaded) BDFDB.TooltipUtils.create(reloadButton, PluginStores.updateData.downloaded.join(", "), {
							type: "bottom",
							style: "max-width: 420px"
						});
					}
				}],
				buttons: [{
					className: BDFDB.disCN.noticeupdatebuttonall,
					contents: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL,
					onClick: _ => {for (let notice of updateNotice.querySelectorAll(BDFDB.dotCN.noticeupdateentry)) notice.click();}
				}],
				onClose: _ => vanishObserver.disconnect()
			});
			updateNotice.style.setProperty("position", "relative", "important");
			updateNotice.style.setProperty("visibility", "visible", "important");
			updateNotice.style.setProperty("opacity", "1", "important");
			updateNotice.style.setProperty("z-index", "100000", "important");
			let reloadButton = updateNotice.querySelector(BDFDB.dotCN.noticeupdatebuttonreload);
			if (reloadButton) BDFDB.DOMUtils.hide(reloadButton);
		}
		if (updateNotice) {
			let updateNoticeList = updateNotice.querySelector(BDFDB.dotCN.noticeupdateentries);
			if (updateNoticeList && !updateNoticeList.querySelector(`#${pluginName}-notice`)) {
				if (updateNoticeList.childElementCount) updateNoticeList.appendChild(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.noticeupdateseparator}">, </div>`));
				let updateEntry = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.noticeupdateentry}" id="${pluginName}-notice">${pluginName}</div>`);
				updateEntry.addEventListener("click", _ => {
					if (!updateEntry.wasClicked) {
						updateEntry.wasClicked = true;
						BDFDB.PluginUtils.downloadUpdate(pluginName, url);
					}
				});
				updateNoticeList.appendChild(updateEntry);
				if (!updateNoticeList.hasTooltip) {
					updateNoticeList.hasTooltip = true;
					updateNotice.tooltip = BDFDB.TooltipUtils.create(updateNoticeList, BDFDB.LanguageUtils.LibraryStrings.update_notice_click, {
						type: "bottom",
						zIndex: 100001,
						delay: 500,
						onHide: _ => {updateNoticeList.hasTooltip = false;}
					});
				}
			}
		}
	};
	BDFDB.PluginUtils.removeUpdateNotice = function (pluginName, updateNotice = document.querySelector(BDFDB.dotCN.noticeupdate)) {
		if (!pluginName || !updateNotice) return;
		let updateNoticeList = updateNotice.querySelector(BDFDB.dotCN.noticeupdateentries);
		if (updateNoticeList) {
			let noticeEntry = updateNoticeList.querySelector(`#${pluginName}-notice`);
			if (noticeEntry) {
				let nextSibling = noticeEntry.nextSibling;
				let prevSibling = noticeEntry.prevSibling;
				if (nextSibling && BDFDB.DOMUtils.containsClass(nextSibling, BDFDB.disCN.noticeupdateseparator)) nextSibling.remove();
				else if (prevSibling && BDFDB.DOMUtils.containsClass(prevSibling, BDFDB.disCN.noticeupdateseparator)) prevSibling.remove();
				noticeEntry.remove();
			}
			if (!updateNoticeList.childElementCount) {
				let reloadButton = updateNotice.querySelector(BDFDB.dotCN.noticeupdatebuttonreload);
				if (reloadButton) {
					updateNotice.querySelector(BDFDB.dotCN.noticetext).innerText = BDFDB.LanguageUtils.LibraryStrings.update_notice_reload;
					BDFDB.DOMUtils.show(reloadButton);
				}
				else updateNotice.querySelector(BDFDB.dotCN.noticedismiss).click();
			}
		}
	};
	BDFDB.PluginUtils.downloadUpdate = function (pluginName, url) {
		if (pluginName && url) Internal.LibraryRequires.request(url, (error, response, body) => {
			if (error) {
				BDFDB.PluginUtils.removeUpdateNotice(pluginName);
				BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_update_failed", pluginName), {
					type: "danger",
					disableInteractions: true
				});
			}
			else {
				let wasEnabled = BDFDB.BDUtils.isPluginEnabled(pluginName);
				let newName = (body.match(/"name"\s*:\s*"([^"]+)"/) || [])[1] || pluginName;
				let newVersion = (body.match(/@version ([0-9]+\.[0-9]+\.[0-9]+)|['"]([0-9]+\.[0-9]+\.[0-9]+)['"]/i) || []).filter(n => n)[1];
				let oldVersion = PluginStores.updateData.plugins[url].version;
				let fileName = pluginName == "BDFDB" ? "0BDFDB" : pluginName;
				let newFileName = newName == "BDFDB" ? "0BDFDB" : newName;
				Internal.LibraryRequires.fs.writeFile(Internal.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), newFileName + ".plugin.js"), body, _ => {
					if (PluginStores.updateData.plugins[url]) PluginStores.updateData.plugins[url].version = newVersion;
					if (fileName != newFileName) {
						Internal.LibraryRequires.fs.unlink(Internal.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), fileName + ".plugin.js"), _ => {});
						let configPath = Internal.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), fileName + ".config.json");
						Internal.LibraryRequires.fs.exists(configPath, exists => {
							if (exists) Internal.LibraryRequires.fs.rename(configPath, Internal.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), newFileName + ".config.json"), _ => {});
						});
						BDFDB.TimeUtils.timeout(_ => {if (wasEnabled && !BDFDB.BDUtils.isPluginEnabled(newName)) BDFDB.BDUtils.enablePlugin(newName);}, 3000);
					}
					BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_updated", pluginName, "v" + oldVersion, newName, "v" + newVersion), {
						disableInteractions: true
					});
					let updateNotice = document.querySelector(BDFDB.dotCN.noticeupdate);
					if (updateNotice) {
						if (updateNotice.querySelector(BDFDB.dotCN.noticebutton) && !PluginStores.updateData.downloaded.includes(pluginName)) {
							PluginStores.updateData.downloaded.push(pluginName);
						}
						BDFDB.PluginUtils.removeUpdateNotice(pluginName, updateNotice);
					}
				});
			}
		});
	};
	BDFDB.PluginUtils.checkChangeLog = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(plugin.changeLog)) return;
		if (!changeLogs[plugin.name] || BDFDB.NumberUtils.compareVersions(plugin.version, changeLogs[plugin.name])) {
			changeLogs[plugin.name] = plugin.version;
			BDFDB.DataUtils.save(changeLogs, BDFDB, "changeLogs");
			BDFDB.PluginUtils.openChangeLog(plugin);
		}
	};
	BDFDB.PluginUtils.openChangeLog = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(plugin.changeLog)) return;
		let changeLogHTML = "", headers = {
			added: "New Features",
			fixed: "Bug Fixes",
			improved: "Improvements",
			progress: "Progress"
		};
		for (let type in plugin.changeLog) {
			type = type.toLowerCase();
			let className = BDFDB.disCN["changelog" + type];
			if (className) {
				changeLogHTML += `<h1 class="${className} ${BDFDB.disCN.margintop20}"${changeLogHTML.indexOf("<h1") == -1 ? `style="margin-top: 0px !important;"` : ""}>${BDFDB.LanguageUtils && BDFDB.LanguageUtils.LibraryStrings ? BDFDB.LanguageUtils.LibraryStrings["changelog_" + type]  : headers[type]}</h1><ul>`;
				for (let key in plugin.changeLog[type]) changeLogHTML += `<li><strong>${key}</strong>${plugin.changeLog[type][key] ? (": " + plugin.changeLog[type][key] + ".") : ""}</li>`;
				changeLogHTML += `</ul>`
			}
		}
		if (changeLogHTML) BDFDB.ModalUtils.open(plugin, {
			header: `${plugin.name} ${BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG}`,
			subHeader: `Version ${plugin.version}`,
			className: BDFDB.disCN.modalchangelogmodal,
			contentClassName: BDFDB.disCNS.changelogcontainer + BDFDB.disCN.modalminicontent,
			footerDirection: Internal.LibraryComponents.Flex.Direction.HORIZONTAL,
			children: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(changeLogHTML)),
			footerChildren: (plugin == BDFDB || plugin == libraryInstance || PluginStores.loaded[plugin.name] && PluginStores.loaded[plugin.name] == plugin && plugin.author == "DevilBro") && BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.changelogfooter,
				children: [{
					href: "https://www.paypal.me/MircoWittrien",
					name: "PayPal",
					icon: "PAYPAL"
				}, {
					href: "https://www.patreon.com/MircoWittrien",
					name: "Patreon",
					icon: "PATREON"
				}, {
					name: BDFDB.LanguageUtils.LibraryStringsFormat("send", "Solana"),
					icon: "PHANTOM",
					onClick: _ => {
						BDFDB.LibraryRequires.electron.clipboard.write({text: InternalData.mySolana});
						BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("clipboard_success", "Phantom Wallet Key"), {
							type: "success"
						});
					}
				}, {
					name: BDFDB.LanguageUtils.LibraryStringsFormat("send", "Ethereum"),
					icon: "METAMASK",
					onClick: _ => {
						BDFDB.LibraryRequires.electron.clipboard.write({text: InternalData.myEthereum});
						BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("clipboard_success", "MetaMask Wallet Key"), {
							type: "success"
						});
					}
				}].map(data => BDFDB.ReactUtils.createElement(data.href ? Internal.LibraryComponents.Anchor : Internal.LibraryComponents.Clickable, {
					className: BDFDB.disCN.changelogsociallink,
					href: data.href || "",
					onClick: !data.onClick ? (_ => {}) : data.onClick,
					children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
						text: data.name,
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
							name: Internal.LibraryComponents.SvgIcon.Names[data.icon],
							width: 16,
							height: 16
						})
					})
				})).concat(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextElement, {
					size: Internal.LibraryComponents.TextElement.Sizes.SIZE_12,
					children: BDFDB.LanguageUtils.LibraryStrings.donate_message
				}))
			})
		});
	};
	BDFDB.PluginUtils.addLoadingIcon = function (icon) {
		if (!Node.prototype.isPrototypeOf(icon)) return;
		let app = document.querySelector(BDFDB.dotCN.app);
		if (!app) return;
		BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.loadingicon);
		let loadingIconWrapper = document.querySelector(BDFDB.dotCN.app + ">" + BDFDB.dotCN.loadingiconwrapper)
		if (!loadingIconWrapper) {
			loadingIconWrapper = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.loadingiconwrapper}"></div>`);
			app.appendChild(loadingIconWrapper);
			let killObserver = new MutationObserver(changes => {if (!loadingIconWrapper.firstElementChild) BDFDB.DOMUtils.remove(loadingIconWrapper);});
			killObserver.observe(loadingIconWrapper, {childList: true});
		}
		loadingIconWrapper.appendChild(icon);
	};
	BDFDB.PluginUtils.createSettingsPanel = function (addon, props) {
		if (!window.BDFDB_Global.loaded) return "Could not initiate BDFDB Library Plugin! Can not create Settings Panel!";
		addon = addon == BDFDB && Internal || addon;
		if (!BDFDB.ObjectUtils.is(addon)) return;
		let settingsProps = props;
		if (settingsProps && !BDFDB.ObjectUtils.is(settingsProps) && (BDFDB.ReactUtils.isValidElement(settingsProps) || BDFDB.ArrayUtils.is(settingsProps))) settingsProps = {
			children: settingsProps
		};
		return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsPanel, Object.assign({
			addon: addon,
			collapseStates: settingsProps && settingsProps.collapseStates
		}, settingsProps));
	};
	BDFDB.PluginUtils.refreshSettingsPanel = function (plugin, settingsPanel, ...args) {
		if (BDFDB.ObjectUtils.is(plugin)) {
			if (settingsPanel && settingsPanel.props && BDFDB.ObjectUtils.is(settingsPanel.props._instance)) {
				settingsPanel.props._instance.props = Object.assign({}, settingsPanel.props._instance.props, ...args);
				BDFDB.ReactUtils.forceUpdate(settingsPanel.props._instance);
			}
			else if (typeof plugin.getSettingsPanel == "function" && Node.prototype.isPrototypeOf(settingsPanel) && settingsPanel.parentElement) {
				settingsPanel.parentElement.appendChild(plugin.getSettingsPanel(...args));
				settingsPanel.remove();
			}
		}
	};

	window.BDFDB_Global = Object.assign({
		started: true,
		loading: true,
		PluginUtils: {
			buildPlugin: BDFDB.PluginUtils.buildPlugin,
			cleanUp: BDFDB.PluginUtils.cleanUp
		}
	}, config, window.BDFDB_Global);

	
	const request = require("request"), fs = require("fs"), path = require("path");
	
	Internal.writeConfig = function (plugin, path, config) {
		let allData = {};
		try {allData = JSON.parse(fs.readFileSync(path));}
		catch (err) {allData = {};}
		try {fs.writeFileSync(path, JSON.stringify(Object.assign({}, allData, {[Internal.shouldSyncConfig(plugin) ? "all" : BDFDB.UserUtils.me.id]: config}), null, "	"));}
		catch (err) {}
	};
	Internal.readConfig = function (plugin, path) {
		let sync = Internal.shouldSyncConfig(plugin);
		try {
			let config = JSON.parse(fs.readFileSync(path));
			if (config && Object.keys(config).some(n => !(n == "all" || parseInt(n)))) {
				config = {[Internal.shouldSyncConfig(plugin) ? "all" : BDFDB.UserUtils.me.id]: config};
				try {fs.writeFileSync(path, JSON.stringify(config, null, "	"));}
				catch (err) {}
			}
			return config && config[sync ? "all" : BDFDB.UserUtils.me.id] || {};
		}
		catch (err) {return {};}
	};
	Internal.shouldSyncConfig = function (plugin) {
		return plugin.neverSyncData !== undefined ? !plugin.neverSyncData : (plugin.forceSyncData || Internal.settings.general.shareData);
	};
	
	BDFDB.DataUtils = {};
	BDFDB.DataUtils.save = function (data, plugin, key, id) {
		plugin = plugin == BDFDB && Internal || plugin;
		let pluginName = typeof plugin === "string" ? plugin : plugin.name;
		let fileName = pluginName == "BDFDB" ? "0BDFDB" : pluginName;
		let configPath = path.join(BDFDB.BDUtils.getPluginsFolder(), fileName + ".config.json");
		
		let config = Cache.data[pluginName] !== undefined ? Cache.data[pluginName] : (Internal.readConfig(plugin, configPath) || {});
		
		if (key === undefined) config = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
		else {
			if (id === undefined) config[key] = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
			else {
				if (!BDFDB.ObjectUtils.is(config[key])) config[key] = {};
				config[key][id] = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
			}
		}
		
		let configIsObject = BDFDB.ObjectUtils.is(config);
		if (key !== undefined && configIsObject && BDFDB.ObjectUtils.is(config[key]) && BDFDB.ObjectUtils.isEmpty(config[key])) delete config[key];
		if (BDFDB.ObjectUtils.isEmpty(config)) {
			delete Cache.data[pluginName];
			if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
		}
		else {
			if (configIsObject) config = BDFDB.ObjectUtils.sort(config);
			Cache.data[pluginName] = configIsObject ? BDFDB.ObjectUtils.deepAssign({}, config) : config;
			Internal.writeConfig(plugin, configPath, config);
		}
	};

	BDFDB.DataUtils.load = function (plugin, key, id) {
		plugin = plugin == BDFDB && Internal || plugin;
		let pluginName = typeof plugin === "string" ? plugin : plugin.name;
		let fileName = pluginName == "BDFDB" ? "0BDFDB" : pluginName;
		let configPath = path.join(BDFDB.BDUtils.getPluginsFolder(), fileName + ".config.json");
		
		let config = Cache.data[pluginName] !== undefined ? Cache.data[pluginName] : (Internal.readConfig(plugin, configPath) || {});
		let configIsObject = BDFDB.ObjectUtils.is(config);
		Cache.data[pluginName] = configIsObject ? BDFDB.ObjectUtils.deepAssign({}, config) : config;
		
		if (key === undefined) return config;
		else {
			let keyData = configIsObject ? (BDFDB.ObjectUtils.is(config[key]) || config[key] === undefined ? BDFDB.ObjectUtils.deepAssign({}, config[key]) : config[key]) : null;
			if (id === undefined) return keyData;
			else return !BDFDB.ObjectUtils.is(keyData) || keyData[id] === undefined ? null : keyData[id];
		}
	};
	BDFDB.DataUtils.remove = function (plugin, key, id) {
		plugin = plugin == BDFDB && Internal || plugin;
		let pluginName = typeof plugin === "string" ? plugin : plugin.name;
		let fileName = pluginName == "BDFDB" ? "0BDFDB" : pluginName;
		let configPath = path.join(BDFDB.BDUtils.getPluginsFolder(), fileName + ".config.json");
		
		let config = Cache.data[pluginName] !== undefined ? Cache.data[pluginName] : (Internal.readConfig(plugin, configPath) || {});
		let configIsObject = BDFDB.ObjectUtils.is(config);
		
		if (key === undefined || !configIsObject) config = {};
		else {
			if (id === undefined) delete config[key];
			else if (BDFDB.ObjectUtils.is(config[key])) delete config[key][id];
		}
		
		if (BDFDB.ObjectUtils.is(config[key]) && BDFDB.ObjectUtils.isEmpty(config[key])) delete config[key];
		if (BDFDB.ObjectUtils.isEmpty(config)) {
			delete Cache.data[pluginName];
			if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
		}
		else {
			if (configIsObject) config = BDFDB.ObjectUtils.sort(config);
			Cache.data[pluginName] = configIsObject ? BDFDB.ObjectUtils.deepAssign({}, config) : config;
			Internal.writeConfig(plugin, configPath, config);
		}
	};
	BDFDB.DataUtils.get = function (plugin, key, id) {
		plugin = plugin == BDFDB && Internal || plugin;
		plugin = typeof plugin == "string" ? BDFDB.BDUtils.getPlugin(plugin) : plugin;
		const defaults = plugin && plugin.defaults;
		if (!BDFDB.ObjectUtils.is(defaults) || key && !BDFDB.ObjectUtils.is(defaults[key])) return id === undefined ? {} : null;
		let oldC = BDFDB.DataUtils.load(plugin), newC = {}, update = false;
		const checkLayer = (i, j) => {
			let isObj = BDFDB.ObjectUtils.is(defaults[i][j].value);
			if (!newC[i]) newC[i] = {};
			if (oldC[i] == null || oldC[i][j] == null || isObj && (!BDFDB.ObjectUtils.is(oldC[i][j]) || Object.keys(defaults[i][j].value).some(n => defaults[i][j].value[n] != null && !BDFDB.sameProto(defaults[i][j].value[n], oldC[i][j][n])))) {
				newC[i][j] = isObj ? BDFDB.ObjectUtils.deepAssign({}, defaults[i][j].value) : defaults[i][j].value;
				update = true;
			}
			else newC[i][j] = oldC[i][j];
		};
		if (key) {for (let j in defaults[key]) checkLayer(key, j);}
		else {for (let i in defaults) if (BDFDB.ObjectUtils.is(defaults[i])) for (let j in defaults[i]) checkLayer(i, j);}
		if (update) BDFDB.DataUtils.save(Object.assign({}, oldC, newC), plugin);
		
		if (key === undefined) return newC;
		else if (id === undefined) return newC[key] === undefined ? {} : newC[key];
		else return newC[key] === undefined || newC[key][id] === undefined ? null : newC[key][id];
	};
	
	const cssFileName = "0BDFDB.raw.css";
	const dataFileName = "0BDFDB.data.json";
	const cssFilePath = path.join(BDFDB.BDUtils.getPluginsFolder(), cssFileName);
	const dataFilePath = path.join(BDFDB.BDUtils.getPluginsFolder(), dataFileName);
	let InternalData, libHashes = {}, oldLibHashes = BDFDB.DataUtils.load(BDFDB, "hashes"), libraryCSS;
	
	const getBackup = (fileName, path) => {
		return libHashes[fileName] && oldLibHashes[fileName] && libHashes[fileName] == oldLibHashes[fileName] && fs.existsSync(path) && (fs.readFileSync(path) || "").toString();
	};
	const requestLibraryHashes = tryAgain => {
		request("https://api.github.com/repos/mwittrien/BetterDiscordAddons/contents/Library/_res/", {headers: {"user-agent": "node.js"}}, (e, r, b) => {
			if ((e || !b || r.statusCode != 200) && tryAgain) return BDFDB.TimeUtils.timeout(_ => requestLibraryHashes(), 10000);
			try {
				b = JSON.parse(b);
				libHashes[cssFileName] = (b.find(n => n && n.name == cssFileName) || {}).sha;
				libHashes[dataFileName] = (b.find(n => n && n.name == dataFileName) || {}).sha;
				BDFDB.DataUtils.save(libHashes, BDFDB, "hashes")
				requestLibraryData(true);
			}
			catch (err) {requestLibraryData(true);}
		});
	};
	const requestLibraryData = tryAgain => {
		const parseCSS = css => {
			libraryCSS = css;
		
			const backupData = getBackup(dataFileName, dataFilePath);
			if (backupData) parseData(backupData);
			else request.get(`https://mwittrien.github.io/BetterDiscordAddons/Library/_res/${dataFileName}`, (e, r, b) => {
				if ((e || !b || r.statusCode != 200) && tryAgain) return BDFDB.TimeUtils.timeout(_ => requestLibraryData(), 10000);
				if (!e && b && r.statusCode == 200) parseData(b, true);
				else parseData(fs.existsSync(dataFilePath) && (fs.readFileSync(dataFilePath) || "").toString());
			});
		};
		const parseData = (dataString, fetched) => {
			try {InternalData = JSON.parse(dataString);}
			catch (err) {
				if (fetched) {
					try {
						dataString = fs.existsSync(dataFilePath) && (fs.readFileSync(dataFilePath) || "").toString();
						InternalData = JSON.parse(dataString);
					}
					catch (err2) {BDFDB.LogUtils.error(["Failed to initiate Library!", "Failed Fetch!", dataString ? "Corrupt Backup." : "No Backup.", , err2]);}
				}
				else BDFDB.LogUtils.error(["Failed to initiate Library!", dataString ? "Corrupt Backup." : "No Backup.", err]);
			}
			if (fetched && dataString) fs.writeFile(dataFilePath, dataString, _ => {});
			
			Internal.getWebModuleReq = function () {
				if (!Internal.getWebModuleReq.req) {
					const id = "BDFDB-WebModules";
					const req = window.webpackJsonp.push([[], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
					delete req.m[id];
					delete req.c[id];
					Internal.getWebModuleReq.req = req;
				}
				return Internal.getWebModuleReq.req;
			};
			
			if (InternalData) loadLibrary();
			else BdApi.alert("Error", "Could not initiate BDFDB Library Plugin. Check your Internet Connection and make sure GitHub isn't blocked by your Network or try disabling your VPN/Proxy.");
		};
		
		const backupCSS = getBackup(cssFileName, cssFilePath);
		if (backupCSS) parseCSS(backupCSS);
		else request.get(`https://mwittrien.github.io/BetterDiscordAddons/Library/_res/${cssFileName}`, (e, r, b) => {
			if ((e || !b || r.statusCode != 200) && tryAgain) return BDFDB.TimeUtils.timeout(_ => requestLibraryData(), 10000);
			if (!e && b && r.statusCode == 200) {
				fs.writeFile(cssFilePath, b, _ => {});
				parseCSS(b);
			}
			else parseCSS(fs.existsSync(cssFilePath) && (fs.readFileSync(cssFilePath) || "").toString());
		});
	};
	const loadLibrary = _ => {
		InternalData.UserBackgrounds = {};
		if (InternalData.userBackgroundsUrl && InternalData.userBackgroundsProperties) request(InternalData.userBackgroundsUrl, (e3, r3, b3) => {
			if (!e3 && b3 && r3.statusCode == 200) {
				const log = BDFDB.UserUtils.me.id == InternalData.myId || BDFDB.UserUtils.me.id == "350635509275557888", notUsedValues = [];
				try {
					InternalData.UserBackgrounds = JSON.parse(b3);
					for (let id in InternalData.UserBackgrounds) {
						let user = {};
						for (let key in InternalData.UserBackgrounds[id]) {
							if (InternalData.userBackgroundsProperties[key]) user[InternalData.userBackgroundsProperties[key]] = key == "background" ? `url(${InternalData.UserBackgrounds[id][key]})` : InternalData.UserBackgrounds[id][key];
							else if (log && !notUsedValues.includes(key)) notUsedValues.push(key);
						}
						InternalData.UserBackgrounds[id] = user;
					}
					if (notUsedValues.length) BDFDB.LogUtils.warn(["Found unused variables in usrbgs!", notUsedValues]);
				}
				catch (err) {
					InternalData.UserBackgrounds = {};
					if (log) BDFDB.LogUtils.error(["Could not load usrbgs!", err]);
				}
			}
		});
		
		Internal.getPluginURL = function (plugin) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (BDFDB.ObjectUtils.is(plugin)) {
				if (plugin.rawUrl) return plugin.rawUrl;
				else {
					let name = InternalData.PluginNameMap && InternalData.PluginNameMap[plugin.name] || plugin.name;
					return `https://mwittrien.github.io/BetterDiscordAddons/Plugins/${name}/${name}.plugin.js`;
				}
			}
			else return "";
		};
		
		Internal.findModule = function (type, cacheString, filter, useExport, noWarnings = false) {
			if (!BDFDB.ObjectUtils.is(Cache.modules[type])) Cache.modules[type] = {module: {}, export: {}};
			if (useExport && Cache.modules[type].export[cacheString]) return Cache.modules[type].export[cacheString];
			else if (!useExport && Cache.modules[type].module[cacheString]) return Cache.modules[type].module[cacheString];
			else {
				let m = BDFDB.ModuleUtils.find(filter, {useExport: useExport});
				if (m) {
					if (useExport) Cache.modules[type].export[cacheString] = m;
					else Cache.modules[type].module[cacheString] = m;
					return m;
				}
				else if (!noWarnings) BDFDB.LogUtils.warn(`${cacheString} [${type}] not found in WebModules`);
			}
		};
		
		Internal.hasModuleStrings = function (module, strings, ignoreCase) {
			const toString = n => ignoreCase ? n.toString().toLowerCase() : n.toString();
			return [strings].flat(10).filter(n => typeof n == "string").map(ignoreCase ? (n => n.toLowerCase()) : (n => n)).every(string => typeof module == "function" && (toString(module).indexOf(string) > -1 || typeof module.__originalMethod == "function" && toString(module.__originalMethod).indexOf(string) > -1 || typeof module.__originalFunction == "function" && toString(module.__originalFunction).indexOf(string) > -1) || BDFDB.ObjectUtils.is(module) && typeof module.type == "function" && toString(module.type).indexOf(string) > -1);
		};
		
		Internal.getModuleString = function (module) {
			const id = (BDFDB.ModuleUtils.find(m => m == module && m, {useExport: false}) || {}).id;
			if (!id) return "";
			const req = Internal.getWebModuleReq();
			return (req.m[id] || "").toString();
		};
		
		Internal.lazyLoadModuleImports = function (moduleString) {
			return new Promise(callback => {
				if (typeof moduleString !== "string") moduleString = Internal.getModuleString(moduleString);
				if (!moduleString || typeof moduleString !== "string") {
					BDFDB.LogUtils.error("Trying to lazy load Imports but Module is not a String");
					return callback(null);
				}
				let run = true, imports = [], menuIndexes = [];
				while (run) {
					const [matchString, promiseMatch, menuRequest] = moduleString.match(/return (Promise\.all\(.+?\))\.then\((.+?)\)\)/) ?? [];
					if (!promiseMatch) run = false;
					else {
						imports = imports.concat(promiseMatch.match(/\d+/g)?.map(e => Number(e)));
						menuIndexes.push(menuRequest.match(/\d+/)?.[0]);
						moduleString = moduleString.replace(matchString, "");
					}
				}
				if (!imports.length || !menuIndexes.length) {
					BDFDB.LogUtils.error("Trying to lazy load Imports but could not find Indexes");
					return callback(null);
				}
				const req = Internal.getWebModuleReq();
				Promise.all(BDFDB.ArrayUtils.removeCopies(imports).map(i => req.e(i))).then(_ => Promise.all(BDFDB.ArrayUtils.removeCopies(menuIndexes).map(i => req(i)))).then(callback);
			});
		};
		
		BDFDB.ModuleUtils = {};
		BDFDB.ModuleUtils.find = function (filter, config = {}) {
			let useExport = typeof config.useExport != "boolean" ? true : config.useExport;
			let onlySearchUnloaded = typeof config.onlySearchUnloaded != "boolean" ? false : config.onlySearchUnloaded;
			let all = typeof config.all != "boolean" ? false : config.all;
			const req = Internal.getWebModuleReq();
			const found = [];
			if (!onlySearchUnloaded) for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports, r = null;
				if (m && (typeof m == "object" || typeof m == "function") && !!(r = filter(m))) {
					if (all) found.push(useExport ? r : req.c[i]);
					else return useExport ? r : req.c[i];
				}
				if (m && m.__esModule && m.default && (typeof m.default == "object" || typeof m.default == "function")) {
					if (!!(r = filter(m.default))) {
						if (all) found.push(useExport ? r : req.c[i]);
						else return useExport ? r : req.c[i];
					}
					else if (m.default.type && (typeof m.default.type == "object" || typeof m.default.type == "function") && !!(r = filter(m.default.type))) {
						if (all) found.push(useExport ? r : req.c[i]);
						else return useExport ? r : req.c[i];
					}
				}
			}
			for (let i in req.m) if (req.m.hasOwnProperty(i)) {
				let m = req.m[i];
				if (m && typeof m == "function") {
					if (req.c[i] && !onlySearchUnloaded && filter(m)) {
						if (all) found.push(useExport ? req.c[i].exports : req.c[i]);
						else return useExport ? req.c[i].exports : req.c[i];
					}
					if (!req.c[i] && onlySearchUnloaded && filter(m)) {
						const resolved = {}, resolved2 = {};
						m(resolved, resolved2, req);
						const trueResolved = resolved2 && BDFDB.ObjectUtils.isEmpty(resolved2) ? resolved : resolved2;
						if (all) found.push(useExport ? trueResolved.exports : trueResolved);
						else return useExport ? trueResolved.exports : trueResolved;
					}
				}
			}
			if (all) return found;
		};
		BDFDB.ModuleUtils.findByProperties = function (...properties) {
			properties = properties.flat(10);
			let arg2 = properties.pop();
			let arg1 = properties.pop();
			let useExport = true, noWarnings = false;
			if (typeof arg2 != "boolean") properties.push(...[arg1, arg2].filter(n => n));
			else {
				if (typeof arg1 != "boolean") {
					if (arg1) properties.push(arg1);
					useExport = arg2;
				}
				else {
					useExport = arg1;
					noWarnings = arg2;
				}
			}
			return Internal.findModule("prop", JSON.stringify(properties), m => properties.every(prop => {
				const value = m[prop];
				return value !== undefined && !(typeof value == "string" && !value);
			}) && m, useExport, noWarnings);
		};
		BDFDB.ModuleUtils.findByName = function (name, useExport, noWarnings = false) {
			return Internal.findModule("name", JSON.stringify(name), m => m.displayName === name && m || m.render && m.render.displayName === name && m || m[name] && m[name].displayName === name && m[name], typeof useExport != "boolean" ? true : useExport, noWarnings);
		};
		BDFDB.ModuleUtils.findByString = function (...strings) {
			strings = strings.flat(10);
			let arg2 = strings.pop();
			let arg1 = strings.pop();
			let useExport = true, noWarnings = false;
			if (typeof arg2 != "boolean") strings.push(...[arg1, arg2].filter(n => n));
			else {
				if (typeof arg1 != "boolean") {
					if (arg1) strings.push(arg1);
					useExport = arg2;
				}
				else {
					useExport = arg1;
					noWarnings = arg2;
				}
			}
			return Internal.findModule("string", JSON.stringify(strings), m => Internal.hasModuleStrings(m, strings) && m, useExport, noWarnings);
		};
		BDFDB.ModuleUtils.findByPrototypes = function (...protoProps) {
			protoProps = protoProps.flat(10);
			let arg2 = protoProps.pop();
			let arg1 = protoProps.pop();
			let useExport = true, noWarnings = false;
			if (typeof arg2 != "boolean") protoProps.push(...[arg1, arg2].filter(n => n));
			else {
				if (typeof arg1 != "boolean") {
					if (arg1) protoProps.push(arg1);
					useExport = arg2;
				}
				else {
					useExport = arg1;
					noWarnings = arg2;
				}
			}
			return Internal.findModule("proto", JSON.stringify(protoProps), m => m.prototype && protoProps.every(prop => {
				const value = m.prototype[prop];
				return value !== undefined && !(typeof value == "string" && !value);
			}) && m, useExport, noWarnings);
		};
		BDFDB.ModuleUtils.findStringObject = function (props, config = {}) {
			return BDFDB.ModuleUtils.find(m => {
				let amount = Object.keys(m).length;
				return (!config.length || (config.smaller ? amount < config.length : amount == config.length)) && [props].flat(10).every(prop => typeof m[prop] == "string") && m;
			}) || BDFDB.ModuleUtils.find(m => {
				if (typeof m != "function") return false;
				let stringified = m.toString().replace(/\s/g, "");
				if (stringified.indexOf("e=>{e.exports={") != 0) return false;
				let amount = stringified.split(":\"").length - 1;
				return (!config.length || (config.smaller ? amount < config.length : amount == config.length)) && [props].flat(10).every(string => stringified.indexOf(`${string}:`) > -1) && m;
			}, {onlySearchUnloaded: true});
		};
	
		BDFDB.ObserverUtils = {};
		BDFDB.ObserverUtils.connect = function (plugin, eleOrSelec, observer, config = {childList: true}) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !eleOrSelec || !observer) return;
			if (BDFDB.ObjectUtils.isEmpty(plugin.observers)) plugin.observers = {};
			if (!BDFDB.ArrayUtils.is(plugin.observers[observer.name])) plugin.observers[observer.name] = [];
			if (!observer.multi) for (let subinstance of plugin.observers[observer.name]) subinstance.disconnect();
			if (observer.instance) plugin.observers[observer.name].push(observer.instance);
			let instance = plugin.observers[observer.name][plugin.observers[observer.name].length - 1];
			if (instance) {
				let node = Node.prototype.isPrototypeOf(eleOrSelec) ? eleOrSelec : typeof eleOrSelec === "string" ? document.querySelector(eleOrSelec) : null;
				if (node) instance.observe(node, config);
			}
		};
		BDFDB.ObserverUtils.disconnect = function (plugin, observer) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (BDFDB.ObjectUtils.is(plugin) && !BDFDB.ObjectUtils.isEmpty(plugin.observers)) {
				let observername = typeof observer == "string" ? observer : (BDFDB.ObjectUtils.is(observer) ? observer.name : null);
				if (!observername) {
					for (let observer in plugin.observers) for (let instance of plugin.observers[observer]) instance.disconnect();
					delete plugin.observers;
				}
				else if (!BDFDB.ArrayUtils.is(plugin.observers[observername])) {
					for (let instance of plugin.observers[observername]) instance.disconnect();
					delete plugin.observers[observername];
				}
			}
		};

		BDFDB.StoreChangeUtils = {};
		BDFDB.StoreChangeUtils.add = function (plugin, store, callback) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(store) || typeof store.addChangeListener != "function" ||  typeof callback != "function") return;
			BDFDB.StoreChangeUtils.remove(plugin, store, callback);
			if (!BDFDB.ArrayUtils.is(plugin.changeListeners)) plugin.changeListeners = [];
			plugin.changeListeners.push({store, callback});
			store.addChangeListener(callback);
		};
		BDFDB.StoreChangeUtils.remove = function (plugin, store, callback) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.changeListeners)) return;
			if (!store) {
				while (plugin.changeListeners.length) {
					let listener = plugin.changeListeners.pop();
					listener.store.removeChangeListener(listener.callback);
				}
			}
			else if (BDFDB.ObjectUtils.is(store) && typeof store.addChangeListener == "function") {
				if (!callback) {
					for (let listener of plugin.changeListeners) {
						let removedListeners = [];
						if (listener.store == store) {
							listener.store.removeChangeListener(listener.callback);
							removedListeners.push(listener);
						}
						if (removedListeners.length) plugin.changeListeners = plugin.changeListeners.filter(listener => !removedListeners.includes(listener));
					}
				}
				else if (typeof callback == "function") {
					store.removeChangeListener(callback);
					plugin.changeListeners = plugin.changeListeners.filter(listener => listener.store == store && listener.callback == callback);
				}
			}
		};

		var pressedKeys = [], mousePosition;
		BDFDB.ListenerUtils = {};
		BDFDB.ListenerUtils.isPressed = function (key) {
			return pressedKeys.includes(key);
		};
		BDFDB.ListenerUtils.getPosition = function (key) {
			return mousePosition;
		};
		BDFDB.ListenerUtils.add = function (plugin, ele, actions, selectorOrCallback, callbackOrNothing) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || (!Node.prototype.isPrototypeOf(ele) && ele !== window) || !actions) return;
			let callbackIs4th = typeof selectorOrCallback == "function";
			let selector = callbackIs4th ? undefined : selectorOrCallback;
			let callback = callbackIs4th ? selectorOrCallback : callbackOrNothing;
			if (typeof callback != "function") return;
			BDFDB.ListenerUtils.remove(plugin, ele, actions, selector);
			for (let action of actions.split(" ")) {
				action = action.split(".");
				let eventName = action.shift().toLowerCase();
				if (!eventName) return;
				let origEventName = eventName;
				eventName = eventName == "mouseenter" || eventName == "mouseleave" ? "mouseover" : eventName;
				let namespace = (action.join(".") || "") + plugin.name;
				if (!BDFDB.ArrayUtils.is(plugin.eventListeners)) plugin.eventListeners = [];
				let eventCallback = null;
				if (selector) {
					if (origEventName == "mouseenter" || origEventName == "mouseleave") eventCallback = e => {
						for (let child of e.path) if (typeof child.matches == "function" && child.matches(selector) && !child[namespace + "BDFDB" + origEventName]) {
							child[namespace + "BDFDB" + origEventName] = true;
							if (origEventName == "mouseenter") callback(BDFDB.ListenerUtils.copyEvent(e, child));
							let mouseOut = e2 => {
								if (e2.target.contains(child) || e2.target == child || !child.contains(e2.target)) {
									if (origEventName == "mouseleave") callback(BDFDB.ListenerUtils.copyEvent(e, child));
									delete child[namespace + "BDFDB" + origEventName];
									document.removeEventListener("mouseout", mouseOut);
								}
							};
							document.addEventListener("mouseout", mouseOut);
							break;
						}
					};
					else eventCallback = e => {
						for (let child of e.path) if (typeof child.matches == "function" && child.matches(selector)) {
							callback(BDFDB.ListenerUtils.copyEvent(e, child));
							break;
						}
					};
				}
				else eventCallback = e => callback(BDFDB.ListenerUtils.copyEvent(e, ele));
				
				let observer;
				if (Node.prototype.isPrototypeOf(ele)) {
					observer = new MutationObserver(changes => changes.forEach(change => {
						const nodes = Array.from(change.removedNodes);
						if (nodes.indexOf(ele) > -1 || nodes.some(n =>  n.contains(ele))) BDFDB.ListenerUtils.remove(plugin, ele, actions, selector);
					}));
					observer.observe(document.body, {subtree: true, childList: true});
				}

				plugin.eventListeners.push({ele, eventName, origEventName, namespace, selector, eventCallback, observer});
				ele.addEventListener(eventName, eventCallback, true);
			}
		};
		BDFDB.ListenerUtils.remove = function (plugin, ele, actions = "", selector) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.eventListeners)) return;
			if (!ele) {
				while (plugin.eventListeners.length) {
					let listener = plugin.eventListeners.pop();
					listener.ele.removeEventListener(listener.eventName, listener.eventCallback, true);
					if (listener.observer) listener.observer.disconnect();
				}
			}
			else if (Node.prototype.isPrototypeOf(ele) || ele === window) {
				for (let action of actions.split(" ")) {
					action = action.split(".");
					let eventName = action.shift().toLowerCase();
					let namespace = (action.join(".") || "") + plugin.name;
					for (let listener of plugin.eventListeners) {
						let removedListeners = [];
						if (listener.ele == ele && (!eventName || listener.origEventName == eventName) && listener.namespace == namespace && (selector === undefined || listener.selector == selector)) {
							listener.ele.removeEventListener(listener.eventName, listener.eventCallback, true);
							if (listener.observer) listener.observer.disconnect();
							removedListeners.push(listener);
						}
						if (removedListeners.length) plugin.eventListeners = plugin.eventListeners.filter(listener => !removedListeners.includes(listener));
					}
				}
			}
		};
		BDFDB.ListenerUtils.addGlobal = function (plugin, id, keybind, action) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !id || !BDFDB.ArrayUtils.is(keybind) || typeof action != "function") return;
			if (!BDFDB.ObjectUtils.is(plugin.globalKeybinds)) plugin.globalKeybinds = {};
			BDFDB.ListenerUtils.removeGlobal(plugin, id);
			plugin.globalKeybinds[id] = BDFDB.NumberUtils.generateId(Object.entries(plugin.globalKeybinds).map(n => n[1]));
			BDFDB.LibraryModules.WindowUtils.inputEventRegister(plugin.globalKeybinds[id], keybind.map(n => [0, n]), action, {blurred: true, focused: true, keydown: false, keyup: true});
			return (_ => BDFDB.ListenerUtils.removeGlobal(plugin, id));
		};
		BDFDB.ListenerUtils.removeGlobal = function (plugin, id) {
			if (!BDFDB.ObjectUtils.is(plugin) || !plugin.globalKeybinds) return;
			if (!id) {
				for (let cachedId in plugin.globalKeybinds) BDFDB.LibraryModules.WindowUtils.inputEventUnregister(plugin.globalKeybinds[cachedId]);
				plugin.globalKeybinds = {};
			}
			else {
				BDFDB.LibraryModules.WindowUtils.inputEventUnregister(plugin.globalKeybinds[id]);
				delete plugin.globalKeybinds[id];
			}
		};
		BDFDB.ListenerUtils.multiAdd = function (node, actions, callback) {
			if (!Node.prototype.isPrototypeOf(node) || !actions || typeof callback != "function") return;
			for (let action of actions.trim().split(" ").filter(n => n)) node.addEventListener(action, callback, true);
		};
		BDFDB.ListenerUtils.multiRemove = function (node, actions, callback) {
			if (!Node.prototype.isPrototypeOf(node) || !actions || typeof callback != "function") return;
			for (let action of actions.trim().split(" ").filter(n => n)) node.removeEventListener(action, callback, true);
		};
		BDFDB.ListenerUtils.addToChildren = function (node, actions, selector, callback) {
			if (!Node.prototype.isPrototypeOf(node) || !actions || !selector || !selector.trim() || typeof callback != "function") return;
			for (let action of actions.trim().split(" ").filter(n => n)) {
				let eventCallback = callback;
				if (action == "mouseenter" || action == "mouseleave") eventCallback = e => {if (e.target.matches(selector)) callback(e);};
				node.querySelectorAll(selector.trim()).forEach(child => {child.addEventListener(action, eventCallback, true);});
			}
		};
		BDFDB.ListenerUtils.copyEvent = function (e, ele) {
			if (!e || !e.constructor || !e.type) return e;
			let eCopy = new e.constructor(e.type, e);
			Object.defineProperty(eCopy, "originalEvent", {value: e});
			Object.defineProperty(eCopy, "which", {value: e.which});
			Object.defineProperty(eCopy, "keyCode", {value: e.keyCode});
			Object.defineProperty(eCopy, "path", {value: e.path});
			Object.defineProperty(eCopy, "relatedTarget", {value: e.relatedTarget});
			Object.defineProperty(eCopy, "srcElement", {value: e.srcElement});
			Object.defineProperty(eCopy, "target", {value: e.target});
			Object.defineProperty(eCopy, "toElement", {value: e.toElement});
			if (ele) Object.defineProperty(eCopy, "currentTarget", {value: ele});
			return eCopy;
		};
		BDFDB.ListenerUtils.stopEvent = function (e) {
			if (BDFDB.ObjectUtils.is(e)) {
				if (typeof e.preventDefault == "function") e.preventDefault();
				if (typeof e.stopPropagation == "function") e.stopPropagation();
				if (typeof e.stopImmediatePropagation == "function") e.stopImmediatePropagation();
				if (BDFDB.ObjectUtils.is(e.originalEvent)) {
					if (typeof e.originalEvent.preventDefault == "function") e.originalEvent.preventDefault();
					if (typeof e.originalEvent.stopPropagation == "function") e.originalEvent.stopPropagation();
					if (typeof e.originalEvent.stopImmediatePropagation == "function") e.originalEvent.stopImmediatePropagation();
				}
			}
		};
		
		var Toasts = [], NotificationBars = [];
		var ToastQueues = {}, DesktopNotificationQueue = {queue: [], running: false};
		for (let key in LibraryConstants.ToastPositions) ToastQueues[LibraryConstants.ToastPositions[key]] = {queue: [], full: false};
		
		BDFDB.NotificationUtils = {};
		BDFDB.NotificationUtils.toast = function (children, config = {}) {
			if (!children) return;
			let app = document.querySelector(BDFDB.dotCN.appmount) || document.body;
			if (!app) return;
			let position = config.position && LibraryConstants.ToastPositions[config.position] || Internal.settings.choices.toastPosition && LibraryConstants.ToastPositions[Internal.settings.choices.toastPosition] || LibraryConstants.ToastPositions.right;
			
			const runQueue = _ => {
				if (ToastQueues[position].full) return;
				let data = ToastQueues[position].queue.shift();
				if (!data) return;
				
				let id = BDFDB.NumberUtils.generateId(Toasts);
				let toasts = document.querySelector(BDFDB.dotCN.toasts + BDFDB.dotCN[position]);
				if (!toasts) {
					toasts = BDFDB.DOMUtils.create(`<div class="${BDFDB.DOMUtils.formatClassName(BDFDB.disCN.toasts, BDFDB.disCN[position])}"></div>`);
					app.appendChild(toasts);
				}
				
				if (data.config.id) data.toast.id = data.config.id.split(" ").join("");
				if (data.config.className) BDFDB.DOMUtils.addClass(data.toast, data.config.className);
				if (data.config.css) BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomToast" + id, data.config.css);
				if (data.config.style) data.toast.style = Object.assign({}, data.toast.style, data.config.style);
				
				let backgroundColor, fontColor, barColor;
				
				let type = data.config.type && BDFDB.disCN["toast" + data.config.type];
				if (!type) {
					barColor = BDFDB.ColorUtils.getType(data.config.barColor) ? BDFDB.ColorUtils.convert(data.config.barColor, "HEX") : data.config.barColor;
					let comp = BDFDB.ColorUtils.convert(data.config.color, "RGBCOMP");
					if (comp) {
						backgroundColor = BDFDB.ColorUtils.convert(comp, "HEX");
						fontColor = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "#000" : "#FFF";
						BDFDB.DOMUtils.addClass(data.toast, BDFDB.disCN.toastcustom);
					}
					else BDFDB.DOMUtils.addClass(data.toast, BDFDB.disCN.toastdefault);
				}
				else BDFDB.DOMUtils.addClass(data.toast, type);
				
				let loadingInterval;
				let disableInteractions = data.config.disableInteractions && typeof data.config.onClick != "function";
				let timeout = typeof data.config.timeout == "number" && !disableInteractions ? data.config.timeout : 3000;
				timeout = (timeout > 0 ? timeout : 600000) + 300;
				if (data.config.ellipsis && typeof data.children == "string") loadingInterval = BDFDB.TimeUtils.interval(_ => data.toast.update(data.children.endsWith(".....") ? data.children.slice(0, -5) : data.children + "."), 500);
				
				let closeTimeout = BDFDB.TimeUtils.timeout(_ => data.toast.close(), timeout);
				data.toast.close = _ => {
					BDFDB.TimeUtils.clear(closeTimeout);
					if (document.contains(data.toast)) {
						BDFDB.DOMUtils.addClass(data.toast, BDFDB.disCN.toastclosing);
						data.toast.style.setProperty("pointer-events", "none", "important");
						BDFDB.TimeUtils.timeout(_ => {
							if (typeof data.config.onClose == "function") data.config.onClose();
							BDFDB.TimeUtils.clear(loadingInterval);
							BDFDB.ArrayUtils.remove(Toasts, id);
							BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomToast" + id);
							data.toast.remove();
							if (!toasts.querySelectorAll(BDFDB.dotCN.toast).length) toasts.remove();
						}, 300);
					}
					ToastQueues[position].full = false;
					runQueue();
				};
				
				if (disableInteractions) data.toast.style.setProperty("pointer-events", "none", "important");
				else {
					BDFDB.DOMUtils.addClass(data.toast, BDFDB.disCN.toastclosable);
					data.toast.addEventListener("click", event => {
						if (typeof data.config.onClick == "function" && !BDFDB.DOMUtils.getParent(BDFDB.dotCN.toastcloseicon, event.target)) data.config.onClick();
						data.toast.close();
					});
					if (typeof closeTimeout.pause == "function") {
						let paused = false;
						data.toast.addEventListener("mouseenter", _ => {
							if (paused) return;
							paused = true;
							closeTimeout.pause();
						});
						data.toast.addEventListener("mouseleave", _ => {
							if (!paused) return;
							paused = false;
							closeTimeout.resume();
						});
					}
				}
				
				toasts.appendChild(data.toast);
				BDFDB.TimeUtils.timeout(_ => BDFDB.DOMUtils.removeClass(data.toast, BDFDB.disCN.toastopening));
				
				let icon = data.config.avatar ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.AvatarComponents.default, {
					src: data.config.avatar,
					size: Internal.LibraryComponents.AvatarComponents.Sizes.SIZE_24
				}) : ((data.config.icon || data.config.type && LibraryConstants.ToastIcons[data.config.type]) ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
					name: data.config.type && LibraryConstants.ToastIcons[data.config.type] && Internal.LibraryComponents.SvgIcon.Names[LibraryConstants.ToastIcons[data.config.type]],
					iconSVG: data.config.icon,
					width: 18,
					height: 18,
					nativeClass: true
				}) : null);
				
				BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(class BDFDB_Toast extends Internal.LibraryModules.React.Component {
					componentDidMount() {
						data.toast.update = newChildren => {
							if (!newChildren) return;
							data.children = newChildren;
							BDFDB.ReactUtils.forceUpdate(this);
						};
					}
					render() {
						return BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.toastbg,
									style: {backgroundColor: backgroundColor}
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.toastinner,
									style: {color: fontColor},
									children: [
										icon && BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.DOMUtils.formatClassName(data.config.avatar && BDFDB.disCN.toastavatar, BDFDB.disCN.toasticon, data.config.iconClassName),
											children: icon
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.toasttext, data.config.textClassName),
											children: data.children
										}),
										!disableInteractions && BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
											className: BDFDB.disCN.toastcloseicon,
											name: Internal.LibraryComponents.SvgIcon.Names.CLOSE,
											width: 16,
											height: 16
										})
									].filter(n => n)
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.toastbar, barColor && BDFDB.disCN.toastcustombar),
									style: {
										backgroundColor: barColor,
										animation: `toast-bar ${timeout}ms normal linear`
									}
								})
							]
						});
					}
				}, {}), data.toast);
				
				ToastQueues[position].full = (BDFDB.ArrayUtils.sum(Array.from(toasts.childNodes).map(c => {
					let height = BDFDB.DOMUtils.getRects(c).height;
					return height > 50 ? height : 50;
				})) - 100) > BDFDB.DOMUtils.getRects(app).height;
				
				if (typeof data.config.onShow == "function") data.config.onShow();
			};
			
			let toast = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.toast + BDFDB.disCN.toastopening}"></div>`);
			toast.update = _ => {};
			ToastQueues[position].queue.push({children, config, toast});
			runQueue();
			return toast;
		};
		BDFDB.NotificationUtils.desktop = function (content, config = {}) {
			if (!content) return;
			
			const queue = _ => {
				DesktopNotificationQueue.queue.push({content, config});
				runQueue();
			};
			const runQueue = _ => {
				if (DesktopNotificationQueue.running) return;
				let data = DesktopNotificationQueue.queue.shift();
				if (!data) return;
				
				DesktopNotificationQueue.running = true;
				let muted = data.config.silent;
				data.config.silent = data.config.silent || data.config.sound ? true : false;
				let audio = new Audio();
				if (!muted && data.config.sound) {
					audio.src = data.config.sound;
					audio.play();
				}
				let notification = new Notification(data.content, data.config);
				
				let disableInteractions = data.config.disableInteractions && typeof data.config.onClick != "function";
				if (disableInteractions) notification.onclick = _ => {};
				else notification.onclick = _ => {
					if (typeof data.config.onClick == "function") data.config.onClick();
					notification.close();
				};
				
				notification.onclose = _ => {
					audio.pause();
					DesktopNotificationQueue.running = false;
					BDFDB.TimeUtils.timeout(runQueue, 1000);
				}
			};
			
			if (!("Notification" in window)) {}
			else if (Notification.permission === "granted") queue();
			else if (Notification.permission !== "denied") Notification.requestPermission(function (response) {if (response === "granted") queue();});
		};
		BDFDB.NotificationUtils.notice = function (text, config = {}) {
			if (!text) return;
			let layers = document.querySelector(BDFDB.dotCN.layers) || document.querySelector(BDFDB.dotCN.appmount);
			if (!layers) return;
			let id = BDFDB.NumberUtils.generateId(NotificationBars);
			let notice = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.notice + BDFDB.disCN.noticewrapper}" notice-id="${id}"><div class="${BDFDB.disCN.noticedismiss}"${config.forceStyle ? ` style="width: 36px !important; height: 36px !important; position: absolute !important; top: 0 !important; right: 0 !important; left: unset !important;"` : ""}></div><div class="${BDFDB.disCN.noticetext}"></div></div>`);
			layers.parentElement.insertBefore(notice, layers);
			let noticeText = notice.querySelector(BDFDB.dotCN.noticetext);
			if (config.platform) for (let platform of config.platform.split(" ")) if (DiscordClasses["noticeicon" + platform]) {
				let icon = BDFDB.DOMUtils.create(`<i class="${BDFDB.disCN["noticeicon" + platform]}"></i>`);
				BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.noticeplatformicon);
				BDFDB.DOMUtils.removeClass(icon, BDFDB.disCN.noticeicon);
				notice.insertBefore(icon, noticeText);
			}
			if (config.customIcon) {
				let icon = document.createElement("i"), iconInner = BDFDB.DOMUtils.create(config.customIcon);
				if (iconInner.nodeType == Node.TEXT_NODE) icon.style.setProperty("background", `url(${config.customIcon}) center/cover no-repeat`);
				else {
					icon = iconInner;
					if ((icon.tagName || "").toUpperCase() == "SVG") {
						icon.removeAttribute("width");
						icon.setAttribute("height", "100%");
					}
				}
				BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.noticeplatformicon);
				BDFDB.DOMUtils.removeClass(icon, BDFDB.disCN.noticeicon);
				notice.insertBefore(icon, noticeText);
			}
			if (BDFDB.ArrayUtils.is(config.buttons)) for (let data of config.buttons) {
				let contents = typeof data.contents == "string" && data.contents;
				if (contents) {
					let button = BDFDB.DOMUtils.create(`<button class="${BDFDB.DOMUtils.formatClassName(BDFDB.disCN.noticebutton, data.className)}">${contents}</button>`);
					button.addEventListener("click", event => {
						if (data.close) notice.close();
						if (typeof data.onClick == "function") data.onClick(event, notice);
					});
					if (typeof data.onMouseEnter == "function") button.addEventListener("mouseenter", event => data.onMouseEnter(event, notice));
					if (typeof data.onMouseLeave == "function") button.addEventListener("mouseleave", event => data.onMouseLeave(event, notice));
					notice.appendChild(button);
				}
			}
			if (config.id) notice.id = config.id.split(" ").join("");
			if (config.className) BDFDB.DOMUtils.addClass(notice, config.className);
			if (config.textClassName) BDFDB.DOMUtils.addClass(noticeText, config.textClassName);
			if (config.css) BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomNotificationBar" + id, config.css);
			if (config.style) notice.style = config.style;
			if (config.html) noticeText.innerHTML = text;
			else {
				let link = document.createElement("a");
				let newText = [];
				for (let word of text.split(" ")) {
					let encodedWord = BDFDB.StringUtils.htmlEscape(word);
					link.href = word;
					newText.push(link.host && link.host !== window.location.host ? `<label class="${BDFDB.disCN.noticetextlink}">${encodedWord}</label>` : encodedWord);
				}
				noticeText.innerHTML = newText.join(" ");
			}
			let type = null;
			if (config.type && !document.querySelector(BDFDB.dotCNS.chatbase + BDFDB.dotCN.noticestreamer)) {
				if (type = BDFDB.disCN["notice" + config.type]) BDFDB.DOMUtils.addClass(notice, type);
				if (config.type == "premium") {
					let noticeButton = notice.querySelector(BDFDB.dotCN.noticebutton);
					if (noticeButton) BDFDB.DOMUtils.addClass(noticeButton, BDFDB.disCN.noticepremiumaction);
					BDFDB.DOMUtils.addClass(noticeText, BDFDB.disCN.noticepremiumtext);
					notice.insertBefore(BDFDB.DOMUtils.create(`<i class="${BDFDB.disCN.noticepremiumlogo}"></i>`), noticeText);
				}
			}
			if (!type) {
				let comp = BDFDB.ColorUtils.convert(config.color, "RGBCOMP");
				if (comp) {
					let fontColor = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "#000" : "#FFF";
					let backgroundColor = BDFDB.ColorUtils.convert(comp, "HEX");
					let filter = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "brightness(0%)" : "brightness(100%)";
					BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomNotificationBarColorCorrection" + id, `${BDFDB.dotCN.noticewrapper}[notice-id="${id}"]{background-color: ${backgroundColor} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticetext} {color: ${fontColor} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticebutton} {color: ${fontColor} !important;border-color: ${BDFDB.ColorUtils.setAlpha(fontColor, 0.25, "RGBA")} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticebutton}:hover {color: ${backgroundColor} !important;background-color: ${fontColor} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticedismiss} {filter: ${filter} !important;}`);
					BDFDB.DOMUtils.addClass(notice, BDFDB.disCN.noticecustom);
				}
				else BDFDB.DOMUtils.addClass(notice, BDFDB.disCN.noticedefault);
			}
			if (config.forceStyle) {
				notice.style.setProperty("display", "flex", "important");
				notice.style.setProperty("height", "36px", "important");
				notice.style.setProperty("min-width", "70vw", "important");
				notice.style.setProperty("left", "unset", "important");
				notice.style.setProperty("right", "unset", "important");
				let sideMargin = ((BDFDB.DOMUtils.getWidth(document.body.firstElementChild) - BDFDB.DOMUtils.getWidth(notice))/2);
				notice.style.setProperty("left", `${sideMargin}px`, "important");
				notice.style.setProperty("right", `${sideMargin}px`, "important");
				notice.style.setProperty("min-width", "unset", "important");
				notice.style.setProperty("width", "unset", "important");
				notice.style.setProperty("max-width", `calc(100vw - ${sideMargin*2}px)`, "important");
			}
			notice.close = _ => {
				BDFDB.DOMUtils.addClass(notice, BDFDB.disCN.noticeclosing);
				if (config.forceStyle) {
					notice.style.setProperty("overflow", "hidden", "important");
					notice.style.setProperty("height", "0px", "important");
				}
				if (notice.tooltip && typeof notice.tooltip.removeTooltip == "function") notice.tooltip.removeTooltip();
				BDFDB.TimeUtils.timeout(_ => {
					if (typeof config.onClose == "function") config.onClose();
					BDFDB.ArrayUtils.remove(NotificationBars, id);
					BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomNotificationBar" + id);
					BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomNotificationBarColorCorrection" + id);
					BDFDB.DOMUtils.remove(notice);
				}, 500);
			};
			notice.querySelector(BDFDB.dotCN.noticedismiss).addEventListener("click", notice.close);
			return notice;
		};
		BDFDB.NotificationUtils.alert = function (header, body) {
			if (typeof header == "string" && typeof header == "string" && BdApi && typeof BdApi.alert == "function") BdApi.alert(header, body);
		};

		var Tooltips = [];
		BDFDB.TooltipUtils = {};
		BDFDB.TooltipUtils.create = function (anker, text, config = {}) {
			if (!text && !config.guild) return null;
			const itemLayerContainer = document.querySelector(BDFDB.dotCN.appmount +  " > " + BDFDB.dotCN.itemlayercontainer);
			if (!itemLayerContainer || !Node.prototype.isPrototypeOf(anker) || !document.contains(anker)) return null;
			const id = BDFDB.NumberUtils.generateId(Tooltips);
			const itemLayer = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.itemlayer + BDFDB.disCN.itemlayerdisabledpointerevents}"><div class="${BDFDB.disCN.tooltip}" tooltip-id="${id}"><div class="${BDFDB.disCN.tooltipcontent}"></div><div class="${BDFDB.disCN.tooltippointer}"></div></div></div>`);
			itemLayerContainer.appendChild(itemLayer);
			
			const tooltip = itemLayer.firstElementChild;
			const tooltipContent = itemLayer.querySelector(BDFDB.dotCN.tooltipcontent);
			const tooltipPointer = itemLayer.querySelector(BDFDB.dotCN.tooltippointer);
			
			if (config.id) tooltip.id = config.id.split(" ").join("");
			
			if (typeof config.type != "string" || !BDFDB.disCN["tooltip" + config.type.toLowerCase()]) config.type = "top";
			let type = config.type.toLowerCase();
			BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN["tooltip" + type], config.className);
			
			let fontColorIsGradient = false, customBackgroundColor = false, style = "";
			if (config.style) style += config.style;
			if (config.fontColor) {
				fontColorIsGradient = BDFDB.ObjectUtils.is(config.fontColor);
				if (!fontColorIsGradient) style = (style ? (style + " ") : "") + `color: ${BDFDB.ColorUtils.convert(config.fontColor, "RGBA")} !important;`
			}
			if (config.backgroundColor) {
				customBackgroundColor = true;
				let backgroundColorIsGradient = BDFDB.ObjectUtils.is(config.backgroundColor);
				let backgroundColor = !backgroundColorIsGradient ? BDFDB.ColorUtils.convert(config.backgroundColor, "RGBA") : BDFDB.ColorUtils.createGradient(config.backgroundColor);
				style = (style ? (style + " ") : "") + `background: ${backgroundColor} !important; border-color: ${backgroundColorIsGradient ? BDFDB.ColorUtils.convert(config.backgroundColor[type == "left" ? 100 : 0], "RGBA") : backgroundColor} !important;`;
			}
			if (style) tooltip.style = style;
			const zIndexed = config.zIndex && typeof config.zIndex == "number";
			if (zIndexed) {
				itemLayer.style.setProperty("z-index", config.zIndex, "important");
				tooltip.style.setProperty("z-index", config.zIndex, "important");
				tooltipContent.style.setProperty("z-index", config.zIndex, "important");
				BDFDB.DOMUtils.addClass(itemLayerContainer, BDFDB.disCN.itemlayercontainerzindexdisabled);
			}
			if (typeof config.width == "number" && config.width > 196) {
				tooltip.style.setProperty("width", `${config.width}px`, "important");
				tooltip.style.setProperty("max-width", `${config.width}px`, "important");
			}
			if (typeof config.maxWidth == "number" && config.maxWidth > 196) {
				tooltip.style.setProperty("max-width", `${config.maxWidth}px`, "important");
			}
			if (customBackgroundColor) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltipcustom);
			else if (config.color && BDFDB.disCN["tooltip" + config.color.toLowerCase()]) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN["tooltip" + config.color.toLowerCase()]);
			else BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltipprimary);
			
			if (config.list || BDFDB.ObjectUtils.is(config.guild)) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltiplistitem);
			
			const removeTooltip = _ => {
				document.removeEventListener("wheel", wheel);
				document.removeEventListener("mousemove", mouseMove);
				document.removeEventListener("mouseleave", mouseLeave);
				BDFDB.DOMUtils.remove(itemLayer);
				BDFDB.ArrayUtils.remove(Tooltips, id);
				observer.disconnect();
				if (zIndexed) BDFDB.DOMUtils.removeClass(itemLayerContainer, BDFDB.disCN.itemlayercontainerzindexdisabled);
				if (typeof config.onHide == "function") config.onHide(itemLayer, anker);
			};
			const setText = newText => {
				if (BDFDB.ObjectUtils.is(config.guild)) {
					let isMuted = Internal.LibraryModules.MutedUtils.isMuted(config.guild.id);
					let muteConfig = Internal.LibraryModules.MutedUtils.getMuteConfig(config.guild.id);
					
					let children = [typeof newText == "function" ? newText() : newText].flat(10).filter(n => typeof n == "string" || BDFDB.ReactUtils.isValidElement(n));
					
					BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltiprow, BDFDB.disCN.tooltiprowguildname),
								children: [
									BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.Badge, {
										guild: config.guild,
										size: Internal.LibraryModules.StringUtils.cssValueToNumber(Internal.DiscordClassModules.TooltipGuild.iconSize),
										className: BDFDB.disCN.tooltiprowicon
									}),
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltipguildnametext),
										children: fontColorIsGradient ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextGradientElement, {
											gradient: BDFDB.ColorUtils.createGradient(config.fontColor),
											children: config.guild.toString()
										}) : config.guild.toString()
									}),
								]
							}),
							children.length && BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltiprow, BDFDB.disCN.tooltiprowextra),
								children: children
							}),
							config.note && BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltiprow, BDFDB.disCN.tooltiprowextra, BDFDB.disCN.tooltipnote),
								children: config.note
							}),
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildVoiceList, {guild: config.guild}),
							isMuted && muteConfig && (muteConfig.end_time == null ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextElement, {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltipmutetext),
								size: Internal.LibraryComponents.TextElement.Sizes.SIZE_12,
								color: Internal.LibraryComponents.TextElement.Colors.MUTED,
								children: BDFDB.LanguageUtils.LanguageStrings.VOICE_CHANNEL_MUTED
							}) : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.MutedText, {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltipmutetext),
								muteConfig: muteConfig
							}))
						].filter(n => n)
					}), tooltipContent);
				}
				else {
					let children = [typeof newText == "function" ? newText() : newText].flat(10).filter(n => typeof n == "string" || BDFDB.ReactUtils.isValidElement(n));
					children.length && BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
						children: [
							fontColorIsGradient ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(config.fontColor),
								children: children
							}) : children,
							config.note && BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltiprow, BDFDB.disCN.tooltiprowextra, BDFDB.disCN.tooltipnote),
								children: config.note
							})
						]
					}), tooltipContent);
				}
			};
			const update = newText => {
				if (newText) setText(newText);
				let left, top;
				const tRects = BDFDB.DOMUtils.getRects(anker);
				const iRects = BDFDB.DOMUtils.getRects(itemLayer);
				const aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
				const positionOffsets = {height: 10, width: 10};
				const offset = typeof config.offset == "number" ? config.offset : 0;
				switch (type) {
					case "top":
						top = tRects.top - iRects.height - positionOffsets.height + 2 - offset;
						left = tRects.left + (tRects.width - iRects.width) / 2;
						break;
					case "bottom":
						top = tRects.top + tRects.height + positionOffsets.height - 2 + offset;
						left = tRects.left + (tRects.width - iRects.width) / 2;
						break;
					case "left":
						top = tRects.top + (tRects.height - iRects.height) / 2;
						left = tRects.left - iRects.width - positionOffsets.width + 2 - offset;
						break;
					case "right":
						top = tRects.top + (tRects.height - iRects.height) / 2;
						left = tRects.left + tRects.width + positionOffsets.width - 2 + offset;
						break;
					}
					
				itemLayer.style.setProperty("top", `${top}px`, "important");
				itemLayer.style.setProperty("left", `${left}px`, "important");
				
				tooltipPointer.style.removeProperty("margin-left");
				tooltipPointer.style.removeProperty("margin-top");
				if (type == "top" || type == "bottom") {
					if (left < 0) {
						itemLayer.style.setProperty("left", "5px", "important");
						tooltipPointer.style.setProperty("margin-left", `${left - 10}px`, "important");
					}
					else {
						const rightMargin = aRects.width - (left + iRects.width);
						if (rightMargin < 0) {
							itemLayer.style.setProperty("left", `${aRects.width - iRects.width - 5}px`, "important");
							tooltipPointer.style.setProperty("margin-left", `${-1*rightMargin}px`, "important");
						}
					}
				}
				else if (type == "left" || type == "right") {
					if (top < 0) {
						const bRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.titlebar));
						const barCorrection = (bRects.width || 0) >= Math.round(75 * window.outerWidth / aRects.width) ? (bRects.height + 5) : 0;
						itemLayer.style.setProperty("top", `${5 + barCorrection}px`, "important");
						tooltipPointer.style.setProperty("margin-top", `${top - 10 - barCorrection}px`, "important");
					}
					else {
						const bottomMargin = aRects.height - (top + iRects.height);
						if (bottomMargin < 0) {
							itemLayer.style.setProperty("top", `${aRects.height - iRects.height - 5}px`, "important");
							tooltipPointer.style.setProperty("margin-top", `${-1*bottomMargin}px`, "important");
						}
					}
				}
			};

			const wheel = e => {
				const tRects1 = BDFDB.DOMUtils.getRects(anker);
				BDFDB.TimeUtils.clear(wheel.timeout);
				wheel.timeout = BDFDB.TimeUtils.timeout(_ => {
					const tRects2 = BDFDB.DOMUtils.getRects(anker);
					if (tRects1.x != tRects2.x || tRects1.y != tRects2.y) removeTooltip();
				}, 500);
			};
			const mouseMove = e => {
				const parent = e.target.parentElement.querySelector(":hover");
				if (parent && anker != parent && !anker.contains(parent)) removeTooltip();
			};
			const mouseLeave = e => removeTooltip();
			if (!config.perssist) {
				document.addEventListener("wheel", wheel);
				document.addEventListener("mousemove", mouseMove);
				document.addEventListener("mouseleave", mouseLeave);
			}
			
			const observer = new MutationObserver(changes => changes.forEach(change => {
				const nodes = Array.from(change.removedNodes);
				if (nodes.indexOf(itemLayer) > -1 || nodes.indexOf(anker) > -1 || nodes.some(n =>  n.contains(anker))) removeTooltip();
			}));
			observer.observe(document.body, {subtree: true, childList: true});
			
			tooltip.removeTooltip = itemLayer.removeTooltip = removeTooltip;
			tooltip.setText = itemLayer.setText = setText;
			tooltip.update = itemLayer.update = update;
			setText(text);
			update();
			
			if (config.delay) {
				BDFDB.DOMUtils.toggle(itemLayer);
				BDFDB.TimeUtils.timeout(_ => {
					BDFDB.DOMUtils.toggle(itemLayer);
					if (typeof config.onShow == "function") config.onShow(itemLayer, anker);
				}, config.delay);
			}
			else {
				if (typeof config.onShow == "function") config.onShow(itemLayer, anker);
			}
			return itemLayer;
		};
		
		Internal.forceInitiateProcess = function (pluginDataObjs, instance, type) {
			pluginDataObjs = [pluginDataObjs].flat(10).filter(n => n);
			if (pluginDataObjs.length && instance && type) {
				let forceRender = false;
				for (let pluginData of pluginDataObjs) {
					let plugin = pluginData.plugin == BDFDB && Internal || pluginData.plugin, methodNames = [];
					for (let patchType in plugin.patchedModules) {
						if (plugin.patchedModules[patchType][type]) methodNames.push(plugin.patchedModules[patchType][type]);
					}
					methodNames = BDFDB.ArrayUtils.removeCopies(methodNames).flat(10).filter(n => n);
					if (methodNames.includes("componentDidMount")) Internal.initiateProcess(plugin, type, {
						arguments: [],
						instance: instance,
						returnvalue: undefined,
						component: undefined,
						methodname: "componentDidMount",
						patchtypes: pluginData.patchTypes[type]
					});
					if (methodNames.includes("render")) forceRender = true;
					else if (!forceRender && methodNames.includes("componentDidUpdate")) Internal.initiateProcess(plugin, type, {
						arguments: [],
						instance: instance,
						returnvalue: undefined,
						component: undefined,
						methodname: "componentDidUpdate",
						patchtypes: pluginData.patchTypes[type]
					});
				}
				if (forceRender) BDFDB.ReactUtils.forceUpdate(instance);
			}
		};
		Internal.initiateProcess = function (plugin, type, e) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (BDFDB.ObjectUtils.is(plugin) && !plugin.stopping && e.instance) {
				type = Internal.LibraryModules.StringUtils.upperCaseFirstChar(type.split(" _ _ ")[1] || type).replace(/[^A-z0-9]|_/g, "");
				if (typeof plugin[`process${type}`] == "function") {
					if (typeof e.methodname == "string" && (e.methodname.indexOf("componentDid") == 0 || e.methodname.indexOf("componentWill") == 0)) {
						e.node = BDFDB.ReactUtils.findDOMNode(e.instance);
						if (e.node) {
							let tempReturn = plugin[`process${type}`](e);
							return tempReturn !== undefined ? tempReturn : e.returnvalue;
						}
						else BDFDB.TimeUtils.timeout(_ => {
							e.node = BDFDB.ReactUtils.findDOMNode(e.instance);
							if (e.node) plugin[`process${type}`](e);
						});
					}
					else if (e.returnvalue !== undefined || e.patchtypes.includes("before")) {
						let tempReturn = plugin[`process${type}`](e);
						return tempReturn !== undefined ? tempReturn : e.returnvalue;
					}
				}
			}
		};
		Internal.patchObserverData = {observer: null, data: {}};
		Internal.patchPlugin = function (plugin) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(plugin.patchedModules)) return;
			BDFDB.PatchUtils.unpatch(plugin);
			let patchedModules = {};
			for (let patchType in plugin.patchedModules) for (let type in plugin.patchedModules[patchType]) {
				if (!patchedModules[type]) patchedModules[type] = {};
				patchedModules[type][patchType] = plugin.patchedModules[patchType][type];
			}
			for (let type in patchedModules) {
				let pluginData = {plugin: plugin, patchTypes: patchedModules[type]};
				let unmappedType = type.split(" _ _ ")[1] || type;
				
				let finderData = InternalData.ModuleUtilsConfig.Finder[unmappedType];
				let config = {
					classNames: [finderData && finderData.class].flat(10).filter(n => DiscordClasses[n]),
					lazyLoaded: finderData && finderData.lazyLoaded,
					stringFind: finderData && finderData.strings,
					propertyFind: finderData && finderData.props,
					prototypeFind: finderData && finderData.protos,
					specialFilter: finderData && finderData.special && Internal.createFilter(finderData.special),
					subComponent: finderData && finderData.subComponent,
					forceObserve: finderData && finderData.forceObserve,
					exported: finderData && finderData.exported || false,
					path: finderData && finderData.path,
					mapped: InternalData.ModuleUtilsConfig.PatchMap[type]
				};
				config.nonRender = config.specialFilter || BDFDB.ObjectUtils.toArray(pluginData.patchTypes).flat(10).filter(n => n && !InternalData.ModuleUtilsConfig.InstanceFunctions.includes(n)).length > 0;
				config.nonPrototype = !!(config.subComponent && config.subComponent.strings || config.stringFind || config.subComponent && config.subComponent.props || config.propertyFind || config.subComponent && config.subComponent.protos || config.prototypeFind || config.nonRender);
				
				config.mappedType = config.mapped ? config.mapped + " _ _ " + type : type;
				config.name = config.subComponent && config.subComponent.name || config.mappedType.split(" _ _ ")[0];
				
				let component = InternalData.ModuleUtilsConfig.LoadedInComponents[type] && BDFDB.ObjectUtils.get(Internal, InternalData.ModuleUtilsConfig.LoadedInComponents[type]);
				if (component) Internal.patchComponent(pluginData, config.nonRender ? (BDFDB.ModuleUtils.find(m => m == component && m, {useExport: config.exported}) || {}).exports : component, type, config);
				else {
					if (config.mapped) for (let patchType in plugin.patchedModules) if (plugin.patchedModules[patchType][type]) {
						plugin.patchedModules[patchType][config.mappedType] = plugin.patchedModules[patchType][type];
						delete plugin.patchedModules[patchType][type];
					}
					
					let patchSpecial = (func, argument) => {
						let module = BDFDB.ModuleUtils[func](argument, config.exported);
						let exports = module && !config.exported && module.exports || module;
						exports = config.path && BDFDB.ObjectUtils.get(exports, config.path) || exports;
						exports && Internal.patchComponent(pluginData, Internal.isMemoOrForwardRef(exports) ? exports.default : exports, config);
						return exports ? true : false;
					};
					let found = true;
					if (config.lazyLoaded) Internal.addChunkObserver(pluginData, config);
					else if (config.classNames.length) Internal.searchComponent(pluginData, config);
					else if (config.subComponent && config.subComponent.strings || config.stringFind) found = patchSpecial("findByString", config.subComponent && config.subComponent.strings || config.stringFind);
					else if (config.subComponent && config.subComponent.props || config.propertyFind) found = patchSpecial("findByProperties", config.subComponent && config.subComponent.props || config.propertyFind);
					else if (config.subComponent && config.subComponent.protos || config.prototypeFind) found = patchSpecial("findByPrototypes", config.subComponent && config.subComponent.protos || config.prototypeFind);
					else if (config.nonRender) found = patchSpecial("findByName", config.name);
					else {
						let module = BDFDB.ModuleUtils.findByName(config.name);
						if (module) Internal.patchComponent(pluginData, module, config);
						else found = false;
					}
					if (!found) Internal.addChunkObserver(pluginData, config);
				}
			}
		};
		Internal.patchComponent = function (pluginDataObjs, instance, config) {
			pluginDataObjs = [pluginDataObjs].flat(10).filter(n => n);
			if (pluginDataObjs.length && instance) {
				instance = instance[BDFDB.ReactUtils.instanceKey] && instance[BDFDB.ReactUtils.instanceKey].type ? instance[BDFDB.ReactUtils.instanceKey].type : instance;
				if (instance) {
					let toBePatched = config.nonPrototype || !instance.prototype ? instance : instance.prototype;
					toBePatched = toBePatched && toBePatched.type && typeof toBePatched.type.render == "function" ? toBePatched.type : toBePatched;
					if (config.subComponent) {
						for (let pluginData of pluginDataObjs) BDFDB.PatchUtils.patch(pluginData.plugin, toBePatched, config.subComponent.type || "default", {after: e => {
							for (let patchType in pluginData.patchTypes) BDFDB.PatchUtils.patch(pluginData.plugin, config.subComponent.children && e.returnValue.props && e.returnValue.props.children ? e.returnValue.props.children[0] || e.returnValue.props.children : e.returnValue , "type", {
								[patchType]: e2 => Internal.initiateProcess(pluginData.plugin, config.mappedType, {
									arguments: e2.methodArguments,
									instance: e2.thisObject,
									returnvalue: e2.returnValue,
									component: toBePatched,
									methodname: e.originalMethodName,
									patchtypes: [patchType]
								})
							}, {name, noCache: true});
						}}, {name: config.name});
					}
					else {
						for (let pluginData of pluginDataObjs) for (let patchType in pluginData.patchTypes) {
							BDFDB.PatchUtils.patch(pluginData.plugin, toBePatched, pluginData.patchTypes[patchType], {
								[patchType]: e => Internal.initiateProcess(pluginData.plugin, config.mappedType, {
									arguments: e.methodArguments,
									instance: e.thisObject,
									returnvalue: e.returnValue,
									component: toBePatched,
									methodname: e.originalMethodName,
									patchtypes: [patchType]
								})
							}, {name: config.name});
						}
					}
				}
			}
		};
		Internal.createFilter = function (config) {
			return ins => ins && config.every(prop => {
				let value = BDFDB.ObjectUtils.get(ins, prop.path);
				return value && (!prop.value || [prop.value].flat(10).filter(n => typeof n == "string").some(n => value.toUpperCase().indexOf(n.toUpperCase()) == 0));
			}) && ins.return.type;
		};
		Internal.isMemoOrForwardRef = function (exports) {
			return exports && exports.default && typeof exports.default.$$typeof == "symbol" && ((exports.default.$$typeof.toString() || "").indexOf("memo") > -1 || (exports.default.$$typeof.toString() || "").indexOf("forward_ref") > -1);
		};
		Internal.checkElementForComponent = function (pluginDataObjs, ele, config) {
			pluginDataObjs = [pluginDataObjs].flat(10).filter(n => n);
			let ins = BDFDB.ReactUtils.getInstance(ele);
			if (typeof config.specialFilter == "function") {
				let component = config.specialFilter(ins);
				if (component) {
					if (config.nonRender) {
						let exports = (BDFDB.ModuleUtils.find(m => m == component && m, {useExport: false}) || {}).exports;
						Internal.patchComponent(pluginDataObjs, Internal.isMemoOrForwardRef(exports) ? exports.default : exports, config);
					}
					else Internal.patchComponent(pluginDataObjs, component, config);
					BDFDB.PatchUtils.forceAllUpdates(pluginDataObjs.map(n => n.plugin), config.mappedType);
					return true;
				}
			}
			else {
				let unmappedType = config.mappedType.split(" _ _ ")[1] || config.mappedType;
				let constructor = BDFDB.ReactUtils.findConstructor(ins, unmappedType) || BDFDB.ReactUtils.findConstructor(ins, unmappedType, {up: true});
				if (constructor) {
					Internal.patchComponent(pluginDataObjs, constructor, config);
					BDFDB.PatchUtils.forceAllUpdates(pluginDataObjs.map(n => n.plugin), config.mappedType);
					return true;
				}
			}
			return false;
		};
		Internal.searchComponent = function (pluginData, config) {
			let instanceFound = false;
			if (!config.forceObserve) {
				const app = document.querySelector(BDFDB.dotCN.app);
				if (app) {
					let appIns = BDFDB.ReactUtils.findConstructor(app, config.mappedType, {unlimited: true}) || BDFDB.ReactUtils.findConstructor(app, config.mappedType, {unlimited: true, up: true});
					if (appIns && (instanceFound = true)) Internal.patchComponent(pluginData, appIns, config);
				}
			}
			if (!instanceFound) {
				let elementFound = false, classes = config.classNames.map(n => BDFDB.disCN[n]), selector = config.classNames.map(n => BDFDB.dotCN[n]).join(", ");
				for (let ele of document.querySelectorAll(selector)) {
					elementFound = Internal.checkElementForComponent(pluginData, ele, config);
					if (elementFound) break;
				}
				if (!elementFound) {
					if (!Internal.patchObserverData.observer) {
						let appMount = document.querySelector(BDFDB.dotCN.appmount);
						if (appMount) {
							Internal.patchObserverData.observer = new MutationObserver(cs => cs.forEach(c => c.addedNodes.forEach(n => {
								if (!n || !n.tagName) return;
								for (let type in Internal.patchObserverData.data) {
									if (!Internal.patchObserverData.data[type] || Internal.patchObserverData.data[type].found) return;
									for (let ele of [BDFDB.DOMUtils.containsClass(n, ...Internal.patchObserverData.data[type].classes) && n].concat([...n.querySelectorAll(Internal.patchObserverData.data[type].selector)]).filter(n => n)) {
										if (!Internal.patchObserverData.data[type] || Internal.patchObserverData.data[type].found) return;
										Internal.patchObserverData.data[type].found = Internal.checkElementForComponent(Internal.patchObserverData.data[type].plugins, ele, Internal.patchObserverData.data[type].config);
										if (Internal.patchObserverData.data[type].found) {
											delete Internal.patchObserverData.data[type];
											if (BDFDB.ObjectUtils.isEmpty(Internal.patchObserverData.data)) {
												Internal.patchObserverData.observer.disconnect();
												Internal.patchObserverData.observer = null;
											}
										}
									}
								}
							})));
							Internal.patchObserverData.observer.observe(appMount, {childList: true, subtree: true});
						}
					}
					if (!Internal.patchObserverData.data[config.mappedType]) Internal.patchObserverData.data[config.mappedType] = {selector, classes, found: false, config, plugins: []};
					Internal.patchObserverData.data[config.mappedType].plugins.push(pluginData);
				}
			}
		};
		
		BDFDB.PatchUtils = {};
		BDFDB.PatchUtils.isPatched = function (plugin, module, methodName) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!plugin || (!BDFDB.ObjectUtils.is(module) && !BDFDB.ArrayUtils.is(module)) || !module.BDFDB_patches || !methodName) return false;
			const pluginId = (typeof plugin === "string" ? plugin : plugin.name).toLowerCase();
			return pluginId && module[methodName] && module[methodName].__is_BDFDB_patched && module.BDFDB_patches[methodName] && BDFDB.ObjectUtils.toArray(module.BDFDB_patches[methodName]).some(patchObj => BDFDB.ObjectUtils.toArray(patchObj).some(priorityObj => Object.keys(priorityObj).includes(pluginId)));
		};
		BDFDB.PatchUtils.patch = function (plugin, module, methodNames, patchMethods, config = {}) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!plugin || (!BDFDB.ObjectUtils.is(module) && !BDFDB.ArrayUtils.is(module)) || !methodNames || !BDFDB.ObjectUtils.is(patchMethods)) return null;
			patchMethods = BDFDB.ObjectUtils.filter(patchMethods, type => InternalData.ModuleUtilsConfig.PatchTypes.includes(type), true);
			if (BDFDB.ObjectUtils.isEmpty(patchMethods)) return null;
			const pluginName = (typeof plugin === "string" ? plugin : plugin.name) || "";
			const pluginVersion = typeof plugin === "string" ? "" : plugin.version;
			const pluginId = pluginName.toLowerCase();
			let patchPriority = !isNaN(config.priority) ? config.priority : (BDFDB.ObjectUtils.is(plugin) && !isNaN(plugin.patchPriority) ? plugin.patchPriority : 5);
			patchPriority = patchPriority < 1 ? (plugin == Internal ? 0 : 1) : (patchPriority > 9 ? (plugin == Internal ? 10 : 9) : Math.round(patchPriority));
			if (!BDFDB.ObjectUtils.is(module.BDFDB_patches)) module.BDFDB_patches = {};
			methodNames = [methodNames].flat(10).filter(n => n);
			let cancel = _ => {BDFDB.PatchUtils.unpatch(plugin, module, methodNames);};
			for (let methodName of methodNames) if (module[methodName] == null || typeof module[methodName] == "function") {
				if (!module.BDFDB_patches[methodName] || config.force && (!module[methodName] || !module[methodName].__is_BDFDB_patched)) {
					if (!module.BDFDB_patches[methodName]) {
						module.BDFDB_patches[methodName] = {};
						for (let type of InternalData.ModuleUtilsConfig.PatchTypes) module.BDFDB_patches[methodName][type] = {};
					}
					if (!module[methodName]) module[methodName] = (_ => {});
					const name = config.name || (module.constructor ? (module.constructor.displayName || module.constructor.name) : "module");
					const originalMethod = module[methodName];
					module.BDFDB_patches[methodName].originalMethod = originalMethod;
					module[methodName] = function () {
						let callInstead = false, stopCall = false;
						const data = {
							thisObject: this && this !== window ? this : {props: arguments[0]},
							methodArguments: arguments,
							originalMethod: originalMethod,
							originalMethodName: methodName,
							callOriginalMethod: _ => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments),
							callOriginalMethodAfterwards: _ => (callInstead = true, data.returnValue),
							stopOriginalMethodCall: _ => stopCall = true
						};
						if (module.BDFDB_patches && module.BDFDB_patches[methodName]) {
							for (let priority in module.BDFDB_patches[methodName].before) for (let id in BDFDB.ObjectUtils.sort(module.BDFDB_patches[methodName].before[priority])) {
								BDFDB.TimeUtils.suppress(module.BDFDB_patches[methodName].before[priority][id], `"before" callback of ${methodName} in ${name}`, {name: module.BDFDB_patches[methodName].before[priority][id].pluginName, version: module.BDFDB_patches[methodName].before[priority][id].pluginVersion})(data);
							}
							
							if (!module.BDFDB_patches || !module.BDFDB_patches[methodName]) return (methodName == "render" || methodName == "default") && data.returnValue === undefined ? null : data.returnValue;
							let hasInsteadPatches = BDFDB.ObjectUtils.toArray(module.BDFDB_patches[methodName].instead).some(priorityObj => !BDFDB.ObjectUtils.isEmpty(priorityObj));
							if (hasInsteadPatches) for (let priority in module.BDFDB_patches[methodName].instead) for (let id in BDFDB.ObjectUtils.sort(module.BDFDB_patches[methodName].instead[priority])) if (module.BDFDB_patches) {
								let tempReturn = BDFDB.TimeUtils.suppress(module.BDFDB_patches[methodName].instead[priority][id], `"instead" callback of ${methodName} in ${name}`, {name: module.BDFDB_patches[methodName].instead[priority][id].pluginName, version: module.BDFDB_patches[methodName].instead[priority][id].pluginVersion})(data);
								if (tempReturn !== undefined) data.returnValue = tempReturn;
							}
							if ((!hasInsteadPatches || callInstead) && !stopCall) BDFDB.TimeUtils.suppress(data.callOriginalMethod, `originalMethod of ${methodName} in ${name}`, {name: "Discord"})();
							
							if (!module.BDFDB_patches || !module.BDFDB_patches[methodName]) return methodName == "render" && data.returnValue === undefined ? null : data.returnValue;
							for (let priority in module.BDFDB_patches[methodName].after) for (let id in BDFDB.ObjectUtils.sort(module.BDFDB_patches[methodName].after[priority])) if (module.BDFDB_patches) {
								let tempReturn = BDFDB.TimeUtils.suppress(module.BDFDB_patches[methodName].after[priority][id], `"after" callback of ${methodName} in ${name}`, {name: module.BDFDB_patches[methodName].after[priority][id].pluginName, version: module.BDFDB_patches[methodName].after[priority][id].pluginVersion})(data);
								if (tempReturn !== undefined) data.returnValue = tempReturn;
							}
						}
						else BDFDB.TimeUtils.suppress(data.callOriginalMethod, `originalMethod of ${methodName} in ${name}`)();
						callInstead = false, stopCall = false;
						return (methodName == "render" || methodName == "default") && data.returnValue === undefined ? null : data.returnValue;
					};
					for (let key of Object.keys(originalMethod)) module[methodName][key] = originalMethod[key];
					if (!module[methodName].__originalFunction) {
						let realOriginalMethod = originalMethod.__originalMethod || originalMethod.__originalFunction || originalMethod;
						if (typeof realOriginalMethod == "function") {
							module[methodName].__originalFunction = realOriginalMethod;
							module[methodName].toString = _ => realOriginalMethod.toString();
						}
					}
					module[methodName].__is_BDFDB_patched = true;
				}
				for (let type in patchMethods) if (typeof patchMethods[type] == "function") {
					if (!BDFDB.ObjectUtils.is(module.BDFDB_patches[methodName][type][patchPriority])) module.BDFDB_patches[methodName][type][patchPriority] = {};
					module.BDFDB_patches[methodName][type][patchPriority][pluginId] = (...args) => {
						if (config.once || !plugin.started) cancel();
						return patchMethods[type](...args);
					};
					module.BDFDB_patches[methodName][type][patchPriority][pluginId].pluginName = pluginName;
					module.BDFDB_patches[methodName][type][patchPriority][pluginId].pluginVersion = pluginVersion;
				}
			}
			if (BDFDB.ObjectUtils.is(plugin) && !config.once && !config.noCache) {
				if (!BDFDB.ArrayUtils.is(plugin.patchCancels)) plugin.patchCancels = [];
				plugin.patchCancels.push(cancel);
			}
			return cancel;
		};
		BDFDB.PatchUtils.unpatch = function (plugin, module, methodNames) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!module && !methodNames) {
				if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ArrayUtils.is(plugin.patchCancels)) while (plugin.patchCancels.length) (plugin.patchCancels.pop())();
			}
			else {
				if ((!BDFDB.ObjectUtils.is(module) && !BDFDB.ArrayUtils.is(module)) || !module.BDFDB_patches) return;
				const pluginId = !plugin ? null : (typeof plugin === "string" ? plugin : plugin.name).toLowerCase();
				if (methodNames) {
					for (let methodName of [methodNames].flat(10).filter(n => n)) if (module[methodName] && module.BDFDB_patches[methodName]) unpatch(methodName, pluginId);
				}
				else for (let patchedMethod of module.BDFDB_patches) unpatch(patchedMethod, pluginId);
			}
			function unpatch (funcName, pluginId) {
				for (let type of InternalData.ModuleUtilsConfig.PatchTypes) {
					if (pluginId) for (let priority in module.BDFDB_patches[funcName][type]) {
						delete module.BDFDB_patches[funcName][type][priority][pluginId];
						if (BDFDB.ObjectUtils.isEmpty(module.BDFDB_patches[funcName][type][priority])) delete module.BDFDB_patches[funcName][type][priority];
					}
					else delete module.BDFDB_patches[funcName][type];
				}
				if (BDFDB.ObjectUtils.isEmpty(BDFDB.ObjectUtils.filter(module.BDFDB_patches[funcName], key => InternalData.ModuleUtilsConfig.PatchTypes.includes(key) && !BDFDB.ObjectUtils.isEmpty(module.BDFDB_patches[funcName][key]), true))) {
					module[funcName] = module.BDFDB_patches[funcName].originalMethod;
					delete module.BDFDB_patches[funcName];
					if (BDFDB.ObjectUtils.isEmpty(module.BDFDB_patches)) delete module.BDFDB_patches;
				}
			}
		};
		BDFDB.PatchUtils.forceAllUpdates = function (plugins, selectedTypes) {
			plugins = [plugins].flat(10).map(n => n == BDFDB && Internal || n).filter(n => BDFDB.ObjectUtils.is(n.patchedModules));
			if (plugins.length) {
				const app = document.querySelector(BDFDB.dotCN.app);
				const bdSettings = document.querySelector("#bd-settingspane-container > *");
				if (app) {
					selectedTypes = [selectedTypes].flat(10).filter(n => n).map(type => type && InternalData.ModuleUtilsConfig.PatchMap[type] ? InternalData.ModuleUtilsConfig.PatchMap[type] + " _ _ " + type : type);
					let updateData = {};
					for (let plugin of plugins) {
						updateData[plugin.name] = {
							filteredModules: [],
							specialModules: [],
							specialModuleTypes: [],
							patchTypes: {}
						};
						for (let patchType in plugin.patchedModules) for (let type in plugin.patchedModules[patchType]) {
							let methodNames = [plugin.patchedModules[patchType][type]].flat(10).filter(n => n);
							if (BDFDB.ArrayUtils.includes(methodNames, "componentDidMount", "componentDidUpdate", "render", false) && (!selectedTypes.length || selectedTypes.includes(type))) {
								let unmappedType = type.split(" _ _ ")[1] || type;
								let selector = [InternalData.ModuleUtilsConfig.Finder[unmappedType]].flat(10).filter(n => DiscordClasses[n]).map(n => BDFDB.dotCN[n]).join(", ");
								let specialFilter = InternalData.ModuleUtilsConfig.Finder[unmappedType] && InternalData.ModuleUtilsConfig.Finder[unmappedType].special && Internal.createFilter(InternalData.ModuleUtilsConfig.Finder[unmappedType].special);
								if (selector && typeof specialFilter == "function") {
									for (let ele of document.querySelectorAll(selector)) {
										let constro = specialFilter(BDFDB.ReactUtils.getInstance(ele));
										if (constro) {
											updateData[plugin.name].specialModules.push([type, constro]);
											updateData[plugin.name].specialModuleTypes.push(type);
											break;
										}
									}
								}
								else updateData[plugin.name].filteredModules.push(type);
								let name = type.split(" _ _ ")[0];
								if (!updateData[plugin.name].patchTypes[name]) updateData[plugin.name].patchTypes[name] = [];
								updateData[plugin.name].patchTypes[name].push(patchType);
							}
						}
					}
					let updateDataArray = BDFDB.ObjectUtils.toArray(updateData);
					if (BDFDB.ArrayUtils.sum(updateDataArray.map(n => n.filteredModules.length + n.specialModules.length))) {
						try {
							let filteredModules = BDFDB.ArrayUtils.removeCopies(updateDataArray.map(n => n.filteredModules).flat(10));
							let specialModules = BDFDB.ArrayUtils.removeCopies(updateDataArray.map(n => n.specialModules).flat(10));
							const appInsDown = BDFDB.ReactUtils.findOwner(app, {name: filteredModules, type: specialModules, all: true, unlimited: true, group: true});
							const appInsUp = BDFDB.ReactUtils.findOwner(app, {name: filteredModules, type: specialModules, all: true, unlimited: true, group: true, up: true});
							for (let type in appInsDown) {
								let filteredPlugins = plugins.filter(n => updateData[n.name].filteredModules.includes(type) || updateData[n.name].specialModuleTypes.includes(type)).map(n => ({plugin: n, patchTypes: updateData[n.name].patchTypes}));
								for (let ins of appInsDown[type]) Internal.forceInitiateProcess(filteredPlugins, ins, type);
							}
							for (let type in appInsUp) {
								let filteredPlugins = plugins.filter(n => updateData[n.name].filteredModules.includes(type) || updateData[n.name].specialModuleTypes.includes(type)).map(n => ({plugin: n, patchTypes: updateData[n.name].patchTypes}));
								for (let ins of appInsUp[type]) Internal.forceInitiateProcess(filteredPlugins, ins, type);
							}
							if (bdSettings) {
								const bdSettingsIns = BDFDB.ReactUtils.findOwner(bdSettings, {name: filteredModules, type: specialModules, all: true, unlimited: true});
								if (bdSettingsIns.length) {
									const bdSettingsWrap = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.getInstance(document.querySelector("#bd-settingspane-container > *")), {props: "onChange", up: true});
									if (bdSettingsWrap && bdSettingsWrap.props && typeof bdSettingsWrap.props.onChange == "function") bdSettingsWrap.props.onChange(bdSettingsWrap.props.type);
								}
							}
						}
						catch (err) {for (let plugin of plugins) BDFDB.LogUtils.error(["Could not force update Components!", err], plugin);}
					}
				}
			}
		};

		BDFDB.DiscordConstants = BDFDB.ModuleUtils.findByProperties("Permissions", "ActivityTypes");
		
		const DiscordObjects = {};
		Internal.DiscordObjects = new Proxy(DiscordObjects, {
			get: function (_, item) {
				if (DiscordObjects[item]) return DiscordObjects[item];
				if (!InternalData.DiscordObjects[item]) return (function () {});
				if (InternalData.DiscordObjects[item].props) DiscordObjects[item] = BDFDB.ModuleUtils.findByPrototypes(InternalData.DiscordObjects[item].props);
				else if (InternalData.DiscordObjects[item].strings) DiscordObjects[item] = BDFDB.ModuleUtils.findByString(InternalData.DiscordObjects[item].strings);
				if (InternalData.DiscordObjects[item].value) DiscordObjects[item] = (DiscordObjects[item] || {})[InternalData.DiscordObjects[item].value];
				return DiscordObjects[item] ? DiscordObjects[item] : (function () {});
			}
		});
		BDFDB.DiscordObjects = Internal.DiscordObjects;
		
		const LibraryRequires = {};
		Internal.LibraryRequires = new Proxy(LibraryRequires, {
			get: function (_, item) {
				if (LibraryRequires[item]) return LibraryRequires[item];
				if (InternalData.LibraryRequires.indexOf(item) == -1) return (function () {});
				try {LibraryRequires[item] = require(item);}
				catch (err) {}
				return LibraryRequires[item] ? LibraryRequires[item] : (function () {});
			}
		});
		BDFDB.LibraryRequires = Internal.LibraryRequires;
		
		const LibraryModules = {};
		LibraryModules.LanguageStore = BDFDB.ModuleUtils.find(m => m.Messages && m.Messages.IMAGE && m);
		LibraryModules.React = BDFDB.ModuleUtils.findByProperties("createElement", "cloneElement");
		LibraryModules.ReactDOM = BDFDB.ModuleUtils.findByProperties("render", "findDOMNode");
		Internal.LibraryModules = new Proxy(LibraryModules, {
			get: function (_, item) {
				if (LibraryModules[item]) return LibraryModules[item];
				if (!InternalData.LibraryModules[item]) return null;
				if (InternalData.LibraryModules[item].props) {
					if (InternalData.LibraryModules[item].nonProps) {
						LibraryModules[item] = BDFDB.ModuleUtils.find(m => InternalData.LibraryModules[item].props.every(prop => {
							const value = m[prop];
							return value !== undefined && !(typeof value == "string" && !value);
						}) && InternalData.LibraryModules[item].nonProps.every(prop => m[prop] === undefined) && m);
						if (!LibraryModules[item]) BDFDB.LogUtils.warn(`${JSON.stringify([InternalData.LibraryModules[item].props, InternalData.LibraryModules[item].nonProps].flat(10))} [props + nonProps] not found in WebModules`);
					}
					else LibraryModules[item] = BDFDB.ModuleUtils.findByProperties(InternalData.LibraryModules[item].props);
				}
				else if (InternalData.LibraryModules[item].strings) LibraryModules[item] = BDFDB.ModuleUtils.findByString(InternalData.LibraryModules[item].strings);
				if (InternalData.LibraryModules[item].value) LibraryModules[item] = (LibraryModules[item] || {})[InternalData.LibraryModules[item].value];
				return LibraryModules[item] ? LibraryModules[item] : null;
			}
		});
		
		BDFDB.LibraryModules = Internal.LibraryModules;
		
		if (Internal.LibraryModules.KeyCodeUtils) Internal.LibraryModules.KeyCodeUtils.getString = function (keyArray) {
			return Internal.LibraryModules.KeyCodeUtils.toString([keyArray].flat(10).filter(n => n).map(keyCode => [BDFDB.DiscordConstants.KeyboardDeviceTypes.KEYBOARD_KEY, Internal.LibraryModules.KeyCodeUtils.keyToCode((Object.entries(Internal.LibraryModules.KeyEvents.codes).find(n => n[1] == keyCode && Internal.LibraryModules.KeyCodeUtils.keyToCode(n[0], null)) || [])[0], null) || keyCode]), true);
		};
		
		BDFDB.ReactUtils = Object.assign({}, Internal.LibraryModules.React, Internal.LibraryModules.ReactDOM);
		BDFDB.ReactUtils.childrenToArray = function (parent) {
			if (parent && parent.props && parent.props.children && !BDFDB.ArrayUtils.is(parent.props.children)) {
				const child = parent.props.children;
				parent.props.children = [];
				parent.props.children.push(child);
			}
			return parent.props.children;
		}
		BDFDB.ReactUtils.createElement = function (component, props = {}, errorWrap = false) {
			if (component && component.defaultProps) for (let key in component.defaultProps) if (props[key] == null) props[key] = component.defaultProps[key];
			try {
				let child = Internal.LibraryModules.React.createElement(component || "div", props) || null;
				if (errorWrap) return Internal.LibraryModules.React.createElement(Internal.ErrorBoundary, {key: child && child.key || ""}, child) || null;
				else return child;
			}
			catch (err) {BDFDB.LogUtils.error(["Could not create React Element!", err]);}
			return null;
		};
		BDFDB.ReactUtils.objectToReact = function (obj) {
			if (!obj) return null;
			else if (typeof obj == "string") return obj;
			else if (BDFDB.ObjectUtils.is(obj)) return BDFDB.ReactUtils.createElement(obj.type || obj.props && obj.props.href && "a" || "div", !obj.props ?  {} : Object.assign({}, obj.props, {
				children: obj.props.children ? BDFDB.ReactUtils.objectToReact(obj.props.children) : null
			}));
			else if (BDFDB.ArrayUtils.is(obj)) return obj.map(n => BDFDB.ReactUtils.objectToReact(n));
			else return null;
		};
		BDFDB.ReactUtils.markdownParse = function (str) {
			if (!BDFDB.ReactUtils.markdownParse.parser || !BDFDB.ReactUtils.markdownParse.render) {
				BDFDB.ReactUtils.markdownParse.parser = Internal.LibraryModules.SimpleMarkdownParser.parserFor(Internal.LibraryModules.SimpleMarkdownParser.defaultRules);
				BDFDB.ReactUtils.markdownParse.render = Internal.LibraryModules.SimpleMarkdownParser.reactFor(Internal.LibraryModules.SimpleMarkdownParser.ruleOutput(Internal.LibraryModules.SimpleMarkdownParser.defaultRules, "react"));
			}
			return BDFDB.ReactUtils.markdownParse.render(BDFDB.ReactUtils.markdownParse.parser(str, {inline: true}));
		};
		BDFDB.ReactUtils.elementToReact = function (node, ref) {
			if (BDFDB.ReactUtils.isValidElement(node)) return node;
			else if (!Node.prototype.isPrototypeOf(node)) return null;
			else if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
			let attributes = {}, importantStyles = [];
			if (typeof ref == "function") attributes.ref = ref;
			if (node.attributes) {
				for (let attr of node.attributes) attributes[attr.name] = attr.value;
				if (node.attributes.style) attributes.style = BDFDB.ObjectUtils.filter(node.style, n => node.style[n] && isNaN(parseInt(n)), true);
			}
			attributes.children = [];
			if (node.style && node.style.cssText) for (let propStr of node.style.cssText.split(";")) if (propStr.endsWith("!important")) {
				let key = propStr.split(":")[0];
				let camelprop = key.replace(/-([a-z]?)/g, (m, g) => g.toUpperCase());
				if (attributes.style[camelprop] != null) importantStyles.push(key);
			}
			for (let child of node.childNodes) attributes.children.push(BDFDB.ReactUtils.elementToReact(child));
			attributes.className = BDFDB.DOMUtils.formatClassName(attributes.className, attributes.class);
			delete attributes.class;
			return BDFDB.ReactUtils.forceStyle(BDFDB.ReactUtils.createElement(node.tagName, attributes), importantStyles);
		};
		BDFDB.ReactUtils.forceStyle = function (reactEle, styles) {
			if (!BDFDB.ReactUtils.isValidElement(reactEle)) return null;
			if (!BDFDB.ObjectUtils.is(reactEle.props.style) || !BDFDB.ArrayUtils.is(styles) || !styles.length) return reactEle;
			let ref = reactEle.ref;
			reactEle.ref = instance => {
				if (typeof ref == "function") ref(instance);
				let node = BDFDB.ReactUtils.findDOMNode(instance);
				if (Node.prototype.isPrototypeOf(node)) for (let key of styles) {
					let propValue = reactEle.props.style[key.replace(/-([a-z]?)/g, (m, g) => g.toUpperCase())];
					if (propValue != null) node.style.setProperty(key, propValue, "important");
				}
			};
			return reactEle;
		};
		BDFDB.ReactUtils.findChild = function (nodeOrInstance, config) {
			if (!nodeOrInstance || !BDFDB.ObjectUtils.is(config) || !config.name && !config.key && !config.props && !config.filter) return config.all ? [] : null;
			let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
			if (!BDFDB.ObjectUtils.is(instance) && !BDFDB.ArrayUtils.is(instance)) return null;
			config.name = config.name && [config.name].flat().filter(n => n);
			config.key = config.key && [config.key].flat().filter(n => n);
			config.props = config.props && [config.props].flat().filter(n => n);
			config.filter = typeof config.filter == "function" && config.filter;
			let depth = -1;
			let start = performance.now();
			let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
			let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
			
			let foundChildren = [];
			let singleChild = getChild(instance);
			if (config.all) {
				for (let i in foundChildren) delete foundChildren[i].BDFDBreactSearch;
				return foundChildren;
			}
			else return singleChild;
			
			function getChild (children) {
				let result = null;
				if (!children || depth >= maxDepth || performance.now() - start >= maxTime) return result;
				if (!BDFDB.ArrayUtils.is(children)) {
					if (check(children)) {
						if (config.all === undefined || !config.all) result = children;
						else if (config.all) {
							if (!children.BDFDBreactSearch) {
								children.BDFDBreactSearch = true;
								foundChildren.push(children);
							}
						}
					}
					else {
						if (children.props && children.props.children) {
							depth++;
							result = getChild(children.props.children);
							depth--;
						}
						if (!result && children.props && children.props.child) {
							depth++;
							result = getChild(children.props.child);
							depth--;
						}
					}
				}
				else {
					for (let child of children) if (child) {
						if (BDFDB.ArrayUtils.is(child)) result = getChild(child);
						else if (check(child)) {
							if (config.all === undefined || !config.all) result = child;
							else if (config.all) {
								if (!child.BDFDBreactSearch) {
									child.BDFDBreactSearch = true;
									foundChildren.push(child);
								}
							}
						}
						else {
							if (child.props && child.props.children) {
								depth++;
								result = getChild(child.props.children);
								depth--;
							}
							if (!result && child.props && child.props.child) {
								depth++;
								result = getChild(child.props.child);
								depth--;
							}
						}
						if (result) break;
					}
				}
				return result;
			}
			function check (instance) {
				if (!instance) return false;
				let props = instance.stateNode ? instance.stateNode.props : instance.props;
				return instance.type && config.name && config.name.some(name => BDFDB.ReactUtils.isCorrectInstance(instance, name)) || config.key && config.key.some(key => instance.key == key) || props && config.props && config.props[config.someProps ? "some" : "every"](prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkValue => propCheck(props, prop[0], checkValue)) : propCheck(props, prop[0], prop[1])) : props[prop] !== undefined) || config.filter && config.filter(instance);
			}
			function propCheck (props, key, value) {
				return key != null && props[key] != null && value != null && (key == "className" ? (" " + props[key] + " ").indexOf(" " + value + " ") > -1 : BDFDB.equals(props[key], value));
			}
		};
		BDFDB.ReactUtils.setChild = function (parent, stringOrChild) {
			if (!BDFDB.ReactUtils.isValidElement(parent) || (!BDFDB.ReactUtils.isValidElement(stringOrChild) && typeof stringOrChild != "string" && !BDFDB.ArrayUtils.is(stringOrChild))) return;
			let set = false;
			checkParent(parent);
			function checkParent(child) {
				if (set) return;
				if (!BDFDB.ArrayUtils.is(child)) checkChild(child);
				else for (let subChild of child) checkChild(subChild);
			}
			function checkChild(child) {
				if (!BDFDB.ReactUtils.isValidElement(child)) return;
				if (BDFDB.ReactUtils.isValidElement(child.props.children)) checkParent(child.props.children);
				else if (BDFDB.ArrayUtils.is(child.props.children)) {
					if (child.props.children.every(c => !c || typeof c == "string")) {
						set = true;
						child.props.children = [stringOrChild].flat(10);
					}
					else checkParent(child.props.children);
				}
				else {
					set = true;
					child.props.children = stringOrChild;
				}
			}
		};
		BDFDB.ReactUtils.findConstructor = function (nodeOrInstance, types, config = {}) {
			if (!BDFDB.ObjectUtils.is(config)) return null;
			if (!nodeOrInstance || !types) return config.all ? (config.group ? {} : []) : null;
			let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
			if (!BDFDB.ObjectUtils.is(instance)) return config.all ? (config.group ? {} : []) : null;
			types = types && [types].flat(10).filter(n => typeof n == "string");
			if (!types.length) return config.all ? (config.group ? {} : []) : null;;
			let depth = -1;
			let start = performance.now();
			let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
			let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
			let whitelist = config.up ? {
				return: true,
				sibling: true,
				default: true
			} : {
				child: true,
				sibling: true,
				default: true
			};
			whitelist[BDFDB.ReactUtils.instanceKey] = true;
			
			let foundConstructors = config.group ? {} : [];
			let singleConstructor = getConstructor(instance);
			if (config.all) {
				for (let i in foundConstructors) {
					if (config.group) for (let j in foundConstructors[i]) delete foundConstructors[i][j].BDFDBreactSearch;
					else delete foundConstructors[i].BDFDBreactSearch;
				}
				return foundConstructors;
			}
			else return singleConstructor;

			function getConstructor (instance) {
				depth++;
				let result = undefined;
				if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
					if (instance.type && types.some(name => BDFDB.ReactUtils.isCorrectInstance(instance, name.split(" _ _ ")[0]))) {
						if (config.all === undefined || !config.all) result = instance.type;
						else if (config.all) {
							if (!instance.type.BDFDBreactSearch) {
								instance.type.BDFDBreactSearch = true;
								if (config.group) {
									if (instance.type && (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name)) {
										let group = config.name.find(name => (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name || instance.type) == name.split(" _ _ ")[0]) || "Default";
										if (!BDFDB.ArrayUtils.is(foundConstructors[group])) foundConstructors[group] = [];
										foundConstructors[group].push(instance.stateNode);
									}
								}
								else foundConstructors.push(instance.type);
							}
						}
					}
					if (result === undefined) {
						let keys = Object.getOwnPropertyNames(instance);
						for (let i = 0; result === undefined && i < keys.length; i++) {
							let key = keys[i];
							if (key && whitelist[key] && (typeof instance[key] === "object" || typeof instance[key] == "function")) result = getConstructor(instance[key]);
						}
					}
				}
				depth--;
				return result;
			}
		};
		BDFDB.ReactUtils.findDOMNode = function (instance) {
			if (Node.prototype.isPrototypeOf(instance)) return instance;
			if (!instance || !instance.updater || typeof instance.updater.isMounted !== "function" || !instance.updater.isMounted(instance)) return null;
			let node = Internal.LibraryModules.ReactDOM.findDOMNode(instance) || BDFDB.ObjectUtils.get(instance, "child.stateNode");
			return Node.prototype.isPrototypeOf(node) ? node : null;
		};
		BDFDB.ReactUtils.findOwner = function (nodeOrInstance, config) {
			if (!BDFDB.ObjectUtils.is(config)) return null;
			if (!nodeOrInstance || !config.name && !config.type && !config.key && !config.props && !config.filter) return config.all ? (config.group ? {} : []) : null;
			let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
			if (!BDFDB.ObjectUtils.is(instance)) return config.all ? (config.group ? {} : []) : null;
			config.name = config.name && [config.name].flat().filter(n => n);
			config.type = config.type && [config.type].flat().filter(n => n);
			config.key = config.key && [config.key].flat().filter(n => n);
			config.props = config.props && [config.props].flat().filter(n => n);
			config.filter = typeof config.filter == "function" && config.filter;
			let depth = -1;
			let start = performance.now();
			let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
			let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
			let whitelist = config.up ? {
				return: true,
				sibling: true,
				default: true
			} : {
				child: true,
				sibling: true,
				default: true
			};
			whitelist[BDFDB.ReactUtils.instanceKey] = true;
			
			let foundInstances = config.group ? {} : [];
			let singleInstance = getOwner(instance);
			if (config.all) {
				for (let i in foundInstances) {
					if (config.group) for (let j in foundInstances[i]) delete foundInstances[i][j].BDFDBreactSearch;
					else delete foundInstances[i].BDFDBreactSearch;
				}
				return foundInstances;
			}
			else return singleInstance;

			function getOwner (instance) {
				depth++;
				let result = undefined;
				if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
					let props = instance.stateNode ? instance.stateNode.props : instance.props;
					if (instance.stateNode && !Node.prototype.isPrototypeOf(instance.stateNode) && (instance.type && config.name && config.name.some(name => BDFDB.ReactUtils.isCorrectInstance(instance, name.split(" _ _ ")[0])) || instance.type && config.type && config.type.some(type => BDFDB.ArrayUtils.is(type) ? instance.type === type[1] : instance.type === type) || instance.key && config.key && config.key.some(key => instance.key == key) || props && config.props && config.props.every(prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkValue => BDFDB.equals(props[prop[0]], checkValue)) : BDFDB.equals(props[prop[0]], prop[1])) : props[prop] !== undefined)) || config.filter && config.filter(instance)) {
						if (config.all === undefined || !config.all) result = instance.stateNode;
						else if (config.all) {
							if (!instance.stateNode.BDFDBreactSearch) {
								instance.stateNode.BDFDBreactSearch = true;
								if (config.group) {
									if (config.name && instance.type && (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name || instance.type)) {
										let group = config.name.find(name => (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name || instance.type) == name.split(" _ _ ")[0]) || "Default";
										if (!BDFDB.ArrayUtils.is(foundInstances[group])) foundInstances[group] = [];
										foundInstances[group].push(instance.stateNode);
									}
									else if (config.type && instance.type) {
										let group = [config.type.find(t => BDFDB.ArrayUtils.is(t) && instance.type === t[1])].flat(10)[0] || "Default";
										if (!BDFDB.ArrayUtils.is(foundInstances[group])) foundInstances[group] = [];
										foundInstances[group].push(instance.stateNode);
									}
								}
								else foundInstances.push(instance.stateNode);
							}
						}
					}
					if (result === undefined) {
						let keys = Object.getOwnPropertyNames(instance);
						for (let i = 0; result === undefined && i < keys.length; i++) {
							let key = keys[i];
							if (key && whitelist[key] && (typeof instance[key] === "object" || typeof instance[key] == "function")) result = getOwner(instance[key]);
						}
					}
				}
				depth--;
				return result;
			}
		};
		BDFDB.ReactUtils.findParent = function (nodeOrInstance, config) {
			if (!nodeOrInstance || !BDFDB.ObjectUtils.is(config) || !config.name && !config.key && !config.props && !config.filter) return [null, -1];
			let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
			if (!BDFDB.ObjectUtils.is(instance) && !BDFDB.ArrayUtils.is(instance) || instance.props && typeof instance.props.children == "function") return [null, -1];
			config.name = config.name && [config.name].flat().filter(n => n);
			config.key = config.key && [config.key].flat().filter(n => n);
			config.props = config.props && [config.props].flat().filter(n => n);
			config.filter = typeof config.filter == "function" && config.filter;
			let parent, firstArray;
			parent = firstArray = instance;
			while (!BDFDB.ArrayUtils.is(firstArray) && firstArray.props && firstArray.props.children) firstArray = firstArray.props.children;
			if (!BDFDB.ArrayUtils.is(firstArray)) {
				if (parent && parent.props) {
					parent.props.children = [parent.props.children];
					firstArray = parent.props.children;
				}
				else firstArray = [];
			}
			return getParent(instance);
			function getParent (children) {
				let result = [firstArray, -1];
				if (!children) return result;
				if (!BDFDB.ArrayUtils.is(children)) {
					if (check(children)) result = found(children);
					else {
						if (children.props && children.props.children) {
							parent = children;
							result = getParent(children.props.children);
						}
						if (!(result && result[1] > -1) && children.props && children.props.child) {
							parent = children;
							result = getParent(children.props.child);
						}
					}
				}
				else {
					for (let i = 0; result[1] == -1 && i < children.length; i++) if (children[i]) {
						if (BDFDB.ArrayUtils.is(children[i])) {
							parent = children;
							result = getParent(children[i]);
						}
						else if (check(children[i])) {
							parent = children;
							result = found(children[i]);
						}
						else {
							if (children[i].props && children[i].props.children) {
								parent = children[i];
								result = getParent(children[i].props.children);
							}
							if (!(result && result[1] > -1) && children[i].props && children[i].props.child) {
								parent = children[i];
								result = getParent(children[i].props.child);
							}
						}
					}
				}
				return result;
			}
			function found (child) {
				if (BDFDB.ArrayUtils.is(parent)) return [parent, parent.indexOf(child)];
				else {
					parent.props.children = [];
					parent.props.children.push(child);
					return [parent.props.children, 0];
				}
			}
			function check (instance) {
				if (!instance || instance == parent) return false;
				let props = instance.stateNode ? instance.stateNode.props : instance.props;
				return instance.type && config.name && config.name.some(name => BDFDB.ReactUtils.isCorrectInstance(instance, name)) || config.key && config.key.some(key => instance.key == key) || props && config.props && config.props[config.someProps ? "some" : "every"](prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkValue => propCheck(props, prop[0], checkValue)) : propCheck(props, prop[0], prop[1])) : props[prop] !== undefined) || config.filter && config.filter(instance);
			}
			function propCheck (props, key, value) {
				return key != null && props[key] != null && value != null && (key == "className" ? (" " + props[key] + " ").indexOf(" " + value + " ") > -1 : BDFDB.equals(props[key], value));
			}
		};
		BDFDB.ReactUtils.findProps = function (nodeOrInstance, config) {
			if (!BDFDB.ObjectUtils.is(config)) return null;
			if (!nodeOrInstance || !config.name && !config.key) return null;
			let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
			if (!BDFDB.ObjectUtils.is(instance)) return null;
			config.name = config.name && [config.name].flat().filter(n => n);
			config.key = config.key && [config.key].flat().filter(n => n);
			let depth = -1;
			let start = performance.now();
			let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
			let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
			let whitelist = config.up ? {
				return: true,
				sibling: true,
				default: true
			} : {
				child: true,
				sibling: true,
				default: true
			};
			whitelist[BDFDB.ReactUtils.instanceKey] = true;
			return findProps(instance);

			function findProps (instance) {
				depth++;
				let result = undefined;
				if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
					if (instance.memoizedProps && (instance.type && config.name && config.name.some(name => BDFDB.ReactUtils.isCorrectInstance(instance, name.split(" _ _ ")[0])) || config.key && config.key.some(key => instance.key == key))) result = instance.memoizedProps;
					if (result === undefined) {
						let keys = Object.getOwnPropertyNames(instance);
						for (let i = 0; result === undefined && i < keys.length; i++) {
							let key = keys[i];
							if (key && whitelist[key] && (typeof instance[key] === "object" || typeof instance[key] == "function")) result = findProps(instance[key]);
						}
					}
				}
				depth--;
				return result;
			}
		};
		BDFDB.ReactUtils.findValue = function (nodeOrInstance, searchKey, config = {}) {
			if (!BDFDB.ObjectUtils.is(config)) return null;
			if (!nodeOrInstance || typeof searchKey != "string") return config.all ? [] : null;
			let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
			if (!BDFDB.ObjectUtils.is(instance)) return config.all ? [] : null;
			instance = instance[BDFDB.ReactUtils.instanceKey] || instance;
			let depth = -1;
			let start = performance.now();
			let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
			let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
			let whitelist = {
				props: true,
				state: true,
				stateNode: true,
				updater: true,
				prototype: true,
				type: true,
				children: config.up ? false : true,
				memoizedProps: true,
				memoizedState: true,
				child: config.up ? false : true,
				return: config.up ? true : false,
				sibling: config.up ? false : true
			};
			let blacklist = {
				contextSection: true
			};
			if (BDFDB.ObjectUtils.is(config.whitelist)) Object.assign(whitelist, config.whiteList);
			if (BDFDB.ObjectUtils.is(config.blacklist)) Object.assign(blacklist, config.blacklist);
			let foundKeys = [];
			let singleKey = getKey(instance);
			if (config.all) return foundKeys;
			else return singleKey;
			function getKey(instance) {
				depth++;
				let result = undefined;
				if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
					let keys = Object.getOwnPropertyNames(instance);
					for (let i = 0; result === undefined && i < keys.length; i++) {
						let key = keys[i];
						if (key && !blacklist[key]) {
							let value = instance[key];
							if (searchKey === key && (config.value === undefined || BDFDB.equals(config.value, value))) {
								if (config.all === undefined || !config.all) result = value;
								else if (config.all) {
									if (config.noCopies === undefined || !config.noCopies) foundKeys.push(value);
									else if (config.noCopies) {
										let copy = false;
										for (let foundKey of foundKeys) if (BDFDB.equals(value, foundKey)) {
											copy = true;
											break;
										}
										if (!copy) foundKeys.push(value);
									}
								}
							}
							else if ((typeof value === "object" || typeof value == "function") && (whitelist[key] || key[0] == "." || !isNaN(key[0]))) result = getKey(value);
						}
					}
				}
				depth--;
				return result;
			}
		};
		BDFDB.ReactUtils.forceUpdate = function (...instances) {
			for (let ins of instances.flat(10).filter(n => n)) if (ins.updater && typeof ins.updater.isMounted == "function" && ins.updater.isMounted(ins)) ins.forceUpdate();
		};
		BDFDB.ReactUtils.getInstance = function (node) {
			if (!BDFDB.ObjectUtils.is(node)) return null;
			return node[Object.keys(node).find(key => key.startsWith("__reactInternalInstance") || key.startsWith("__reactFiber"))];
		};
		BDFDB.ReactUtils.isCorrectInstance = function (instance, name) {
			return instance && ((instance.type && (instance.type.render && instance.type.render.displayName === name || instance.type.displayName === name || instance.type.name === name || instance.type === name)) || instance.render && (instance.render.displayName === name || instance.render.name === name) || instance.displayName == name || instance.name === name);
		};
		BDFDB.ReactUtils.render = function (component, node) {
			if (!BDFDB.ReactUtils.isValidElement(component) || !Node.prototype.isPrototypeOf(node)) return;
			try {
				Internal.LibraryModules.ReactDOM.render(component, node);
				let observer = new MutationObserver(changes => changes.forEach(change => {
					let nodes = Array.from(change.removedNodes);
					if (nodes.indexOf(node) > -1 || nodes.some(n =>  n.contains(node))) {
						observer.disconnect();
						BDFDB.ReactUtils.unmountComponentAtNode(node);
					}
				}));
				observer.observe(document.body, {subtree: true, childList: true});
			}
			catch (err) {BDFDB.LogUtils.error(["Could not render React Element!", err]);}
		};

		BDFDB.MessageUtils = {};
		BDFDB.MessageUtils.isSystemMessage = function (message) {
			return message && !BDFDB.DiscordConstants.USER_MESSAGE_TYPES.has(message.type) && (message.type !== BDFDB.DiscordConstants.MessageTypes.APPLICATION_COMMAND || message.interaction == null);
		};
		BDFDB.MessageUtils.rerenderAll = function (instant) {
			BDFDB.TimeUtils.clear(BDFDB.MessageUtils.rerenderAll.timeout);
			BDFDB.MessageUtils.rerenderAll.timeout = BDFDB.TimeUtils.timeout(_ => {
				let channelId = Internal.LibraryModules.LastChannelStore.getChannelId();
				if (channelId) {
					if (BDFDB.DMUtils.isDMChannel(channelId)) BDFDB.DMUtils.markAsRead(channelId);
					else BDFDB.ChannelUtils.markAsRead(channelId);
				}
				let LayerProviderIns = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.messageswrapper), {name: "LayerProvider", unlimited: true, up: true});
				let LayerProviderPrototype = BDFDB.ObjectUtils.get(LayerProviderIns, `${BDFDB.ReactUtils.instanceKey}.type.prototype`);
				if (LayerProviderIns && LayerProviderPrototype) {
					BDFDB.PatchUtils.patch({name: "BDFDB MessageUtils"}, LayerProviderPrototype, "render", {after: e => {
						e.returnValue.props.children = typeof e.returnValue.props.children == "function" ? (_ => {return null;}) : [];
						BDFDB.ReactUtils.forceUpdate(LayerProviderIns);
					}}, {once: true});
					BDFDB.ReactUtils.forceUpdate(LayerProviderIns);
				}
			}, instant ? 0 : 1000);
		};
		BDFDB.MessageUtils.openMenu = function (message, e = mousePosition, slim = false) {
			if (!message) return;
			let channel = Internal.LibraryModules.ChannelStore.getChannel(message.channel_id);
			if (!channel) return;
			e = BDFDB.ListenerUtils.copyEvent(e.nativeEvent || e, (e.nativeEvent || e).currentTarget);
			let menu = BDFDB.ModuleUtils.findByName(slim ? "MessageSearchResultContextMenu" : "MessageContextMenu", false, true);
			if (menu) Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, e2 => BDFDB.ReactUtils.createElement(menu.exports.default, Object.assign({}, e2, {message, channel})));
			else Internal.lazyLoadModuleImports(BDFDB.ModuleUtils.findByString(slim ? ["SearchResult", "message:", "openContextMenu"] : ["useHoveredMessage", "useContextMenuUser", "openContextMenu"])).then(_ => {
				menu = BDFDB.ModuleUtils.findByName(slim ? "MessageSearchResultContextMenu" : "MessageContextMenu", false);
				if (menu) Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, e2 => BDFDB.ReactUtils.createElement(menu.exports.default, Object.assign({}, e2, {message, channel})));
			});
		};
			
		BDFDB.UserUtils = {};
		BDFDB.UserUtils.is = function (user) {
			return user && user instanceof Internal.DiscordObjects.User;
		};
		const myDataUser = Internal.LibraryModules.UserStore && Internal.LibraryModules.UserStore.getCurrentUser && Internal.LibraryModules.UserStore.getCurrentUser();
		if (myDataUser && BDFDB.UserUtils._id != myDataUser.id) {
			document.body.setAttribute("data-current-user-id", myDataUser.id);
			BDFDB.UserUtils._id = myDataUser.id;
		}
		BDFDB.UserUtils.me = new Proxy(myDataUser || {}, {
			get: function (list, item) {
				const user = Internal.LibraryModules.UserStore && Internal.LibraryModules.UserStore.getCurrentUser && Internal.LibraryModules.UserStore.getCurrentUser();
				if (user && BDFDB.UserUtils._id != user.id) {
					Cache.data = {};
					document.body.setAttribute("data-current-user-id", user.id);
					BDFDB.UserUtils._id = user.id;
				}
				return user ? user[item] : null;
			}
		});
		BDFDB.UserUtils.getStatus = function (id = BDFDB.UserUtils.me.id) {
			id = typeof id == "number" ? id.toFixed() : id;
			let activity = BDFDB.UserUtils.getActivity(id);
			return activity && activity.type == BDFDB.DiscordConstants.ActivityTypes.STREAMING ? "streaming" : Internal.LibraryModules.StatusMetaUtils.getStatus(id);
		};
		BDFDB.UserUtils.getStatusColor = function (status, useColor) {
			status = typeof status == "string" ? status.toLowerCase() : null;
			switch (status) {
				case "online": return useColor ? BDFDB.DiscordConstants.Colors.STATUS_GREEN_600 : "var(--bdfdb-green)";
				case "idle": return useColor ? BDFDB.DiscordConstants.Colors.STATUS_YELLOW : "var(--bdfdb-yellow)";
				case "dnd": return useColor ? BDFDB.DiscordConstants.Colors.STATUS_RED : "var(--bdfdb-red)";
				case "playing": return useColor ? BDFDB.DiscordConstants.Colors.BRAND : "var(--bdfdb-blurple)";
				case "listening": return BDFDB.DiscordConstants.Colors.SPOTIFY;
				case "streaming": return BDFDB.DiscordConstants.Colors.TWITCH;
				default: return BDFDB.DiscordConstants.Colors.STATUS_GREY;
			}
		};
		BDFDB.UserUtils.getActivity = function (id = BDFDB.UserUtils.me.id) {
			for (let activity of Internal.LibraryModules.StatusMetaUtils.getActivities(id)) if (activity.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS) return activity;
			return null;
		};
		BDFDB.UserUtils.getCustomStatus = function (id = BDFDB.UserUtils.me.id) {
			for (let activity of Internal.LibraryModules.StatusMetaUtils.getActivities(id)) if (activity.type == BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS) return activity;
			return null;
		};
		BDFDB.UserUtils.getAvatar = function (id = BDFDB.UserUtils.me.id) {
			let user = Internal.LibraryModules.UserStore.getUser(id);
			if (!user) return window.location.origin + "/assets/1f0bfc0865d324c2587920a7d80c609b.png";
			else return ((user.avatar ? "" : window.location.origin) + Internal.LibraryModules.IconUtils.getUserAvatarURL(user)).split("?")[0];
		};
		BDFDB.UserUtils.getBanner = function (id = BDFDB.UserUtils.me.id, canAnimate = false) {
			let user = Internal.LibraryModules.UserStore.getUser(id);
			if (!user || !user.banner) return "";
			return Internal.LibraryModules.IconUtils.getUserBannerURL(Object.assign({}, user, {canAnimate})).split("?")[0];
		};
		BDFDB.UserUtils.can = function (permission, id = BDFDB.UserUtils.me.id, channelId = Internal.LibraryModules.LastChannelStore.getChannelId()) {
			if (!BDFDB.DiscordConstants.Permissions[permission]) BDFDB.LogUtils.warn([permission, "not found in Permissions"]);
			else {
				let channel = Internal.LibraryModules.ChannelStore.getChannel(channelId);
				if (channel) return Internal.LibraryModules.PermissionRoleUtils.can({permission: BDFDB.DiscordConstants.Permissions[permission], user: id, context: channel});
			}
			return false;
		};
		BDFDB.UserUtils.openMenu = function (user, guildId, e = mousePosition) {
			if (!user || !guildId) return;
			e = BDFDB.ListenerUtils.copyEvent(e.nativeEvent || e, (e.nativeEvent || e).currentTarget);
			let menu = BDFDB.ModuleUtils.findByName("GuildChannelUserContextMenu", false, true);
			if (menu) Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, e2 => BDFDB.ReactUtils.createElement(menu.exports.default, Object.assign({}, e2, {user, guildId})));
			else Internal.lazyLoadModuleImports(BDFDB.ModuleUtils.findByString("openUserContextMenu", "user:", "openContextMenu")).then(_ => {
				menu = BDFDB.ModuleUtils.findByName("GuildChannelUserContextMenu", false);
				if (menu) Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, e2 => BDFDB.ReactUtils.createElement(menu.exports.default, Object.assign({}, e2, {user, guildId})));
			});
		};

		BDFDB.GuildUtils = {};
		BDFDB.GuildUtils.is = function (guild) {
			if (!BDFDB.ObjectUtils.is(guild)) return false;
			let keys = Object.keys(guild);
			return guild instanceof Internal.DiscordObjects.Guild || Object.keys(new Internal.DiscordObjects.Guild({})).every(key => keys.indexOf(key) > -1);
		};
		BDFDB.GuildUtils.getIcon = function (id) {
			let guild = Internal.LibraryModules.GuildStore.getGuild(id);
			if (!guild || !guild.icon) return "";
			return Internal.LibraryModules.IconUtils.getGuildIconURL(guild).split("?")[0];
		};
		BDFDB.GuildUtils.getBanner = function (id) {
			let guild = Internal.LibraryModules.GuildStore.getGuild(id);
			if (!guild || !guild.banner) return "";
			return Internal.LibraryModules.IconUtils.getGuildBannerURL(guild).split("?")[0];
		};
		BDFDB.GuildUtils.getFolder = function (id) {
			return Internal.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId).find(n => n.guildIds.includes(id));
		};
		BDFDB.GuildUtils.openMenu = function (guild, e = mousePosition) {
			if (!guild) return;
			e = BDFDB.ListenerUtils.copyEvent(e.nativeEvent || e, (e.nativeEvent || e).currentTarget);
			let menu = BDFDB.ModuleUtils.findByName("GuildContextMenu", false, true);
			if (menu) Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, e2 => BDFDB.ReactUtils.createElement(menu.exports.default, Object.assign({}, e2, {guild})));
			else Internal.lazyLoadModuleImports(BDFDB.ModuleUtils.findByString("renderUnavailableBadge", "guild:", "openContextMenu")).then(_ => {
				menu = BDFDB.ModuleUtils.findByName("GuildContextMenu", false);
				if (menu) Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, e2 => BDFDB.ReactUtils.createElement(menu.exports.default, Object.assign({}, e2, {guild})));
			});
		};
		BDFDB.GuildUtils.markAsRead = function (guildIds) {
			guildIds = [guildIds].flat(10).filter(id => id && typeof id == "string" && Internal.LibraryModules.GuildStore.getGuild(id));
			if (!guildIds) return;
			let channels = guildIds.map(id => [BDFDB.ObjectUtils.toArray(Internal.LibraryModules.GuildChannelStore.getChannels(id)), Internal.LibraryModules.GuildEventStore.getGuildScheduledEventsForGuild(id)]).flat(10).map(n => n && (n.channel && n.channel.id || n.id)).flat().filter(n => n);
			if (channels.length) BDFDB.ChannelUtils.markAsRead(channels);
			let eventChannels = guildIds.map(id => ({
				channelId: id,
				readStateType: Internal.LibraryModules.UnreadStateTypes.GUILD_EVENT,
				messageId: Internal.LibraryModules.UnreadChannelUtils.lastMessageId(id, Internal.LibraryModules.UnreadStateTypes.GUILD_EVENT)
			})).filter(n => n.messageId);
			if (eventChannels.length) Internal.LibraryModules.AckUtils.bulkAck(eventChannels);
		};
		BDFDB.GuildUtils.rerenderAll = function (instant) {
			BDFDB.TimeUtils.clear(BDFDB.GuildUtils.rerenderAll.timeout);
			BDFDB.GuildUtils.rerenderAll.timeout = BDFDB.TimeUtils.timeout(_ => {
				let ShakeableIns = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.appcontainer), {name: "Shakeable", unlimited: true, up: true});
				let ShakeablePrototype = BDFDB.ObjectUtils.get(ShakeableIns, `${BDFDB.ReactUtils.instanceKey}.type.prototype`);
				if (ShakeableIns && ShakeablePrototype) {
					BDFDB.PatchUtils.patch({name: "BDFDB GuildUtils"}, ShakeablePrototype, "render", {after: e => {
						e.returnValue.props.children = typeof e.returnValue.props.children == "function" ? (_ => {return null;}) : [];
						BDFDB.ReactUtils.forceUpdate(ShakeableIns);
					}}, {once: true});
					BDFDB.ReactUtils.forceUpdate(ShakeableIns);
				}
			}, instant ? 0 : 1000);
		};

		BDFDB.FolderUtils = {};
		BDFDB.FolderUtils.getId = function (div) {
			if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
			div = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildfolderwrapper, div);
			if (!div) return;
			return BDFDB.ReactUtils.findValue(div, "folderId", {up: true});
		};
		BDFDB.FolderUtils.getDefaultName = function (folderId) {
			let folder = Internal.LibraryModules.FolderStore.getGuildFolderById(folderId);
			if (!folder) return "";
			let rest = 2 * BDFDB.DiscordConstants.MAX_GUILD_FOLDER_NAME_LENGTH;
			let names = [], allNames = folder.guildIds.map(guildId => (Internal.LibraryModules.GuildStore.getGuild(guildId) || {}).name).filter(n => n);
			for (let name of allNames) if (name.length < rest || names.length === 0) {
				names.push(name);
				rest -= name.length;
			}
			return names.join(", ") + (names.length < allNames.length ? ", ..." : "");
		};

		BDFDB.ChannelUtils = {};
		BDFDB.ChannelUtils.is = function (channel) {
			if (!BDFDB.ObjectUtils.is(channel)) return false;
			let keys = Object.keys(channel);
			return channel instanceof Internal.DiscordObjects.Channel || Object.keys(new Internal.DiscordObjects.Channel({})).every(key => keys.indexOf(key) > -1);
		};
		BDFDB.ChannelUtils.isTextChannel = function (channelOrId) {
			let channel = typeof channelOrId == "string" ? Internal.LibraryModules.ChannelStore.getChannel(channelOrId) : channelOrId;
			return BDFDB.ObjectUtils.is(channel) && (channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_TEXT || channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_STORE || channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_ANNOUNCEMENT);
		};
		BDFDB.ChannelUtils.isThread = function (channelOrId) {
			let channel = typeof channelOrId == "string" ? Internal.LibraryModules.ChannelStore.getChannel(channelOrId) : channelOrId;
			return channel && channel.isThread();
		};
		BDFDB.ChannelUtils.isEvent = function (channelOrId) {
			let channel = typeof channelOrId == "string" ? Internal.LibraryModules.GuildEventStore.getGuildScheduledEvent(channelOrId) : channelOrId;
			return channel && Internal.LibraryModules.GuildEventStore.getGuildScheduledEvent(channel.id) && true;
		};
		BDFDB.ChannelUtils.markAsRead = function (channelIds) {
			let unreadChannels = [channelIds].flat(10).filter(id => id && typeof id == "string" && ((BDFDB.ChannelUtils.isTextChannel(id) || BDFDB.ChannelUtils.isThread(id)) && (Internal.LibraryModules.UnreadChannelUtils.hasUnread(id) || Internal.LibraryModules.UnreadChannelUtils.getMentionCount(id) > 0))).map(id => ({
				channelId: id,
				readStateType: Internal.LibraryModules.UnreadStateTypes.CHANNEL,
				messageId: Internal.LibraryModules.UnreadChannelUtils.lastMessageId(id)
			}));
			if (unreadChannels.length) Internal.LibraryModules.AckUtils.bulkAck(unreadChannels);
		};
		BDFDB.ChannelUtils.rerenderAll = function (instant) {
			BDFDB.TimeUtils.clear(BDFDB.ChannelUtils.rerenderAll.timeout);
			BDFDB.ChannelUtils.rerenderAll.timeout = BDFDB.TimeUtils.timeout(_ => {
				let ChannelsIns = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guildchannels), {name: "Channels", unlimited: true});
				let ChannelsPrototype = BDFDB.ObjectUtils.get(ChannelsIns, `${BDFDB.ReactUtils.instanceKey}.type.prototype`);
				if (ChannelsIns && ChannelsPrototype) {
					BDFDB.PatchUtils.patch({name: "BDFDB ChannelUtils"}, ChannelsPrototype, "render", {after: e => {
						e.returnValue.props.children = typeof e.returnValue.props.children == "function" ? (_ => {return null;}) : [];
						BDFDB.ReactUtils.forceUpdate(ChannelsIns);
					}}, {once: true});
					BDFDB.ReactUtils.forceUpdate(ChannelsIns);
				}
			}, instant ? 0 : 1000);
		};
		
		BDFDB.DMUtils = {};
		BDFDB.DMUtils.isDMChannel = function (id) {
			let channel = Internal.LibraryModules.ChannelStore.getChannel(id);
			return BDFDB.ObjectUtils.is(channel) && (channel.isDM() || channel.isGroupDM());
		};
		BDFDB.DMUtils.getIcon = function (id) {
			let channel = Internal.LibraryModules.ChannelStore.getChannel(id);
			if (!channel) return "";
			if (!channel.icon) return channel.isDM() ? BDFDB.UserUtils.getAvatar(channel.recipients[0]) : (channel.isGroupDM() ? window.location.origin + Internal.LibraryModules.IconUtils.getChannelIconURL(channel).split("?")[0] : null);
			return Internal.LibraryModules.IconUtils.getChannelIconURL(channel).split("?")[0];
		};
		BDFDB.DMUtils.markAsRead = function (dmIds) {
			let unreadDMs = [dmIds].flat(10).filter(id => id && typeof id == "string" && BDFDB.DMUtils.isDMChannel(id) && (Internal.LibraryModules.UnreadChannelUtils.hasUnread(id) || Internal.LibraryModules.UnreadChannelUtils.getMentionCount(id) > 0));
			if (unreadDMs.length) for (let i in unreadDMs) BDFDB.TimeUtils.timeout(_ => Internal.LibraryModules.AckUtils.ack(unreadDMs[i]), i * 1000);
		};
		
		BDFDB.ColorUtils = {};
		BDFDB.ColorUtils.convert = function (color, conv, type) {
			if (BDFDB.ObjectUtils.is(color)) {
				var newColor = {};
				for (let pos in color) newColor[pos] = BDFDB.ColorUtils.convert(color[pos], conv, type);
				return newColor;
			}
			else {
				conv = conv === undefined || !conv ? conv = "RGBCOMP" : conv.toUpperCase();
				type = type === undefined || !type || !["RGB", "RGBA", "RGBCOMP", "HSL", "HSLA", "HSLCOMP", "HEX", "HEXA", "INT"].includes(type.toUpperCase()) ? BDFDB.ColorUtils.getType(color) : type.toUpperCase();
				if (conv == "RGBCOMP") {
					switch (type) {
						case "RGBCOMP":
							var rgbComp = [].concat(color);
							if (rgbComp.length == 3) return processRGB(rgbComp);
							else if (rgbComp.length == 4) {
								let a = processA(rgbComp.pop());
								return processRGB(rgbComp).concat(a);
							}
							break;
						case "RGB":
							return processRGB(color.replace(/\s/g, "").slice(4, -1).split(","));
						case "RGBA":
							var rgbComp = color.replace(/\s/g, "").slice(5, -1).split(",");
							var a = processA(rgbComp.pop());
							return processRGB(rgbComp).concat(a);
						case "HSLCOMP":
							var hslComp = [].concat(color);
							if (hslComp.length == 3) return BDFDB.ColorUtils.convert(`hsl(${processHSL(hslComp).join(",")})`, "RGBCOMP");
							else if (hslComp.length == 4) {
								let a = processA(hslComp.pop());
								return BDFDB.ColorUtils.convert(`hsl(${processHSL(hslComp).join(",")})`, "RGBCOMP").concat(a);
							}
							break;
						case "HSL":
							var hslComp = processHSL(color.replace(/\s/g, "").slice(4, -1).split(","));
							var r, g, b, m, c, x, p, q;
							var h = hslComp[0] / 360, l = parseInt(hslComp[1]) / 100, s = parseInt(hslComp[2]) / 100; m = Math.floor(h * 6); c = h * 6 - m; x = s * (1 - l); p = s * (1 - c * l); q = s * (1 - (1 - c) * l);
							switch (m % 6) {
								case 0: r = s, g = q, b = x; break;
								case 1: r = p, g = s, b = x; break;
								case 2: r = x, g = s, b = q; break;
								case 3: r = x, g = p, b = s; break;
								case 4: r = q, g = x, b = s; break;
								case 5: r = s, g = x, b = p; break;
							}
							return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
						case "HSLA":
							var hslComp = color.replace(/\s/g, "").slice(5, -1).split(",");
							return BDFDB.ColorUtils.convert(`hsl(${hslComp.slice(0, 3).join(",")})`, "RGBCOMP").concat(processA(hslComp.pop()));
						case "HEX":
							var hex = /^#([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$|^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
							return [parseInt(hex[1] + hex[1] || hex[4], 16), parseInt(hex[2] + hex[2] || hex[5], 16), parseInt(hex[3] + hex[3] || hex[6], 16)];
						case "HEXA":
							var hex = /^#([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$|^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
							return [parseInt(hex[1] + hex[1] || hex[5], 16), parseInt(hex[2] + hex[2] || hex[6], 16), parseInt(hex[3] + hex[3] || hex[7], 16), Math.floor(BDFDB.NumberUtils.mapRange([0, 255], [0, 100], parseInt(hex[4] + hex[4] || hex[8], 16)))/100];
						case "INT":
							color = processINT(color);
							return [parseInt(color >> 16 & 255), parseInt(color >> 8 & 255), parseInt(color & 255)];
						default:
							return null;
					}
				}
				else {
					if (conv && type && conv.indexOf("HSL") == 0 && type.indexOf("HSL") == 0) {
						if (type == "HSLCOMP") {
							let hslComp = [].concat(color);
							switch (conv) {
								case "HSLCOMP":
									if (hslComp.length == 3) return processHSL(hslComp);
									else if (hslComp.length == 4) {
										var a = processA(hslComp.pop());
										return processHSL(hslComp).concat(a);
									}
									break;
								case "HSL":
									return `hsl(${processHSL(hslComp.slice(0, 3)).join(",")})`;
								case "HSLA":
									hslComp = hslComp.slice(0, 4);
									var a = hslComp.length == 4 ? processA(hslComp.pop()) : 1;
									return `hsla(${processHSL(hslComp).concat(a).join(",")})`;
							}
						}
						return BDFDB.ColorUtils.convert(color.replace(/\s/g, "").slice(color.toUpperCase().indexOf("HSLA") == 0 ? 5 : 4, -1).split(","), conv, "HSLCOMP");
					}
					else {
						let rgbComp = type == "RGBCOMP" ? [].concat(color) : BDFDB.ColorUtils.convert(color, "RGBCOMP", type);
						if (rgbComp) switch (conv) {
							case "RGB":
								return `rgb(${processRGB(rgbComp.slice(0, 3)).join(",")})`;
							case "RGBA":
								rgbComp = rgbComp.slice(0, 4);
								var a = rgbComp.length == 4 ? processA(rgbComp.pop()) : 1;
								return `rgba(${processRGB(rgbComp).concat(a).join(",")})`;
							case "HSLCOMP":
								var a = rgbComp.length == 4 ? processA(rgbComp.pop()) : null;
								var hslComp = processHSL(BDFDB.ColorUtils.convert(rgbComp, "HSL").replace(/\s/g, "").split(","));
								return a != null ? hslComp.concat(a) : hslComp;
							case "HSL":
								var r = processC(rgbComp[0]), g = processC(rgbComp[1]), b = processC(rgbComp[2]);
								var max = Math.max(r, g, b), min = Math.min(r, g, b), dif = max - min, h, l = max === 0 ? 0 : dif / max, s = max / 255;
								switch (max) {
									case min: h = 0; break;
									case r: h = g - b + dif * (g < b ? 6 : 0); h /= 6 * dif; break;
									case g: h = b - r + dif * 2; h /= 6 * dif; break;
									case b: h = r - g + dif * 4; h /= 6 * dif; break;
								}
								return `hsl(${processHSL([Math.round(h * 360), l * 100, s * 100]).join(",")})`;
							case "HSLA":
								var a = rgbComp.length == 4 ? processA(rgbComp.pop()) : 1;
								return `hsla(${BDFDB.ColorUtils.convert(rgbComp, "HSL").slice(4, -1).split(",").concat(a).join(",")})`;
							case "HEX":
								return ("#" + (0x1000000 + (rgbComp[2] | rgbComp[1] << 8 | rgbComp[0] << 16)).toString(16).slice(1)).toUpperCase();
							case "HEXA":
								return ("#" + (0x1000000 + (rgbComp[2] | rgbComp[1] << 8 | rgbComp[0] << 16)).toString(16).slice(1) + (0x100 + Math.round(BDFDB.NumberUtils.mapRange([0, 100], [0, 255], processA(rgbComp[3]) * 100))).toString(16).slice(1)).toUpperCase();
							case "INT":
								return processINT(rgbComp[2] | rgbComp[1] << 8 | rgbComp[0] << 16);
							default:
								return null;
						}
					}
				}
			}
			return null;
			function processC(c) {if (c == null) {return 255;} else {c = parseInt(c.toString().replace(/[^0-9\-]/g, ""));return isNaN(c) || c > 255 ? 255 : c < 0 ? 0 : c;}};
			function processRGB(comp) {return [].concat(comp).map(c => {return processC(c);});};
			function processA(a) {if (a == null) {return 1;} else {a = a.toString();a = (a.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(a.replace(/[^0-9\.\-]/g, ""));return isNaN(a) || a > 1 ? 1 : a < 0 ? 0 : a;}};
			function processSL(sl) {if (sl == null) {return "100%";} else {sl = parseFloat(sl.toString().replace(/[^0-9\.\-]/g, ""));return (isNaN(sl) || sl > 100 ? 100 : sl < 0 ? 0 : sl) + "%";}};
			function processHSL(comp) {comp = [].concat(comp);let h = parseFloat(comp.shift().toString().replace(/[^0-9\.\-]/g, ""));h = isNaN(h) || h > 360 ? 360 : h < 0 ? 0 : h;return [h].concat(comp.map(sl => {return processSL(sl);}));};
			function processINT(c) {if (c == null) {return 16777215;} else {c = parseInt(c.toString().replace(/[^0-9]/g, ""));return isNaN(c) || c > 16777215 ? 16777215 : c < 0 ? 0 : c;}};
		};
		BDFDB.ColorUtils.setAlpha = function (color, a, conv) {
			if (BDFDB.ObjectUtils.is(color)) {
				let newcolor = {};
				for (let pos in color) newcolor[pos] = BDFDB.ColorUtils.setAlpha(color[pos], a, conv);
				return newcolor;
			}
			else {
				let rgbComp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
				if (rgbComp) {
					a = a.toString();
					a = (a.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(a.replace(/[^0-9\.\-]/g, ""));
					a = isNaN(a) || a > 1 ? 1 : a < 0 ? 0 : a;
					rgbComp[3] = a;
					conv = (conv || BDFDB.ColorUtils.getType(color)).toUpperCase();
					conv = conv == "RGB" || conv == "HSL" || conv == "HEX" ? conv + "A" : conv;
					return BDFDB.ColorUtils.convert(rgbComp, conv);
				}
			}
			return null;
		};
		BDFDB.ColorUtils.getAlpha = function (color) {
			let rgbComp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
			if (rgbComp) {
				if (rgbComp.length == 3) return 1;
				else if (rgbComp.length == 4) {
					let a = rgbComp[3].toString();
					a = (a.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(a.replace(/[^0-9\.\-]/g, ""));
					return isNaN(a) || a > 1 ? 1 : a < 0 ? 0 : a;
				}
			}
			return null;
		};
		BDFDB.ColorUtils.change = function (color, value, conv) {
			value = parseFloat(value);
			if (color != null && typeof value == "number" && !isNaN(value)) {
				if (BDFDB.ObjectUtils.is(color)) {
					let newColor = {};
					for (let pos in color) newColor[pos] = BDFDB.ColorUtils.change(color[pos], value, conv);
					return newColor;
				}
				else {
					let rgbComp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
					if (rgbComp) {
						let a = BDFDB.ColorUtils.getAlpha(rgbComp);
						if (parseInt(value) !== value) {
							value = value.toString();
							value = (value.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(value.replace(/[^0-9\.\-]/g, ""));
							value = isNaN(value) ? 0 : value;
							return BDFDB.ColorUtils.convert([].concat(rgbComp).slice(0, 3).map(c => {
								c = Math.round(c * (1 + value));
								return c > 255 ? 255 : c < 0 ? 0 : c;
							}).concat(a), conv || BDFDB.ColorUtils.getType(color));
						}
						else return BDFDB.ColorUtils.convert([].concat(rgbComp).slice(0, 3).map(c => {
							c = Math.round(c + value);
							return c > 255 ? 255 : c < 0 ? 0 : c;
						}).concat(a), conv || BDFDB.ColorUtils.getType(color));
					}
				}
			}
			return null;
		};
		BDFDB.ColorUtils.invert = function (color, conv) {
			if (BDFDB.ObjectUtils.is(color)) {
				let newColor = {};
				for (let pos in color) newColor[pos] = BDFDB.ColorUtils.invert(color[pos], conv);
				return newColor;
			}
			else {
				let comp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
				if (comp) return BDFDB.ColorUtils.convert([255 - comp[0], 255 - comp[1], 255 - comp[2]], conv || BDFDB.ColorUtils.getType(color));
			}
			return null;
		};
		BDFDB.ColorUtils.compare = function (color1, color2) {
			if (color1 && color2) {
				color1 = BDFDB.ColorUtils.convert(color1, "RGBA");
				color2 = BDFDB.ColorUtils.convert(color2, "RGBA");
				if (color1 && color2) return BDFDB.equals(color1, color2);
			}
			return null;
		};
		BDFDB.ColorUtils.isBright = function (color, compare = 160) {
			if (!BDFDB.ColorUtils.getType(color)) return false;
			color = BDFDB.ColorUtils.convert(color, "RGBCOMP");
			if (!color) return false;
			return parseInt(compare) < Math.sqrt(0.299 * color[0]**2 + 0.587 * color[1]**2 + 0.144 * color[2]**2);
		};
		BDFDB.ColorUtils.getType = function (color) {
			if (color != null) {
				if (typeof color === "object" && (color.length == 3 || color.length == 4)) {
					if (isRGB(color)) return "RGBCOMP";
					else if (isHSL(color)) return "HSLCOMP";
				}
				else if (typeof color === "string") {
					if (/^#[a-f\d]{3}$|^#[a-f\d]{6}$/i.test(color)) return "HEX";
					else if (/^#[a-f\d]{4}$|^#[a-f\d]{8}$/i.test(color)) return "HEXA";
					else {
						color = color.toUpperCase();
						let comp = color.replace(/[^0-9\.\-\,\%]/g, "").split(",");
						if (color.indexOf("RGB(") == 0 && comp.length == 3 && isRGB(comp)) return "RGB";
						else if (color.indexOf("RGBA(") == 0 && comp.length == 4 && isRGB(comp)) return "RGBA";
						else if (color.indexOf("HSL(") == 0 && comp.length == 3 && isHSL(comp)) return "HSL";
						else if (color.indexOf("HSLA(") == 0 && comp.length == 4 && isHSL(comp)) return "HSLA";
					}
				}
				else if (typeof color === "number" && parseInt(color) == color && color > -1 && color < 16777216) return "INT";
			}
			return null;
			function isRGB(comp) {return comp.slice(0, 3).every(rgb => rgb.toString().indexOf("%") == -1 && parseFloat(rgb) == parseInt(rgb));};
			function isHSL(comp) {return comp.slice(1, 3).every(hsl => hsl.toString().indexOf("%") == hsl.length - 1);};
		};
		BDFDB.ColorUtils.createGradient = function (colorObj, direction = "to right") {
			let gradientString = "linear-gradient(" + direction;
			for (let pos of Object.keys(colorObj).sort()) {
				let color = BDFDB.ColorUtils.convert(colorObj[pos], "RGBA");
				gradientString += color ? `, ${color} ${pos*100}%` : ''
			}
			return gradientString += ")";
		};

		BDFDB.DOMUtils = {};
		BDFDB.DOMUtils.getSelection = function () {
			let selection = document.getSelection();
			return selection && selection.anchorNode ? selection.getRangeAt(0).toString() : "";
		};
		BDFDB.DOMUtils.addClass = function (eles, ...classes) {
			if (!eles || !classes) return;
			for (let ele of [eles].map(n => NodeList.prototype.isPrototypeOf(n) ? Array.from(n) : n).flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) add(ele);
				else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) add(e);
				else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) add(n);
			}
			function add(node) {
				if (node && node.classList) for (let cla of classes) for (let cl of [cla].flat(10).filter(n => n)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.add(c);
			}
		};
		BDFDB.DOMUtils.removeClass = function (eles, ...classes) {
			if (!eles || !classes) return;
			for (let ele of [eles].map(n => NodeList.prototype.isPrototypeOf(n) ? Array.from(n) : n).flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) remove(ele);
				else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) remove(e);
				else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) remove(n);
			}
			function remove(node) {
				if (node && node.classList) for (let cla of classes) for (let cl of [cla].flat(10).filter(n => n)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.remove(c);
			}
		};
		BDFDB.DOMUtils.toggleClass = function (eles, ...classes) {
			if (!eles || !classes) return;
			var force = classes.pop();
			if (typeof force != "boolean") {
				classes.push(force);
				force = undefined;
			}
			if (!classes.length) return;
			for (let ele of [eles].map(n => NodeList.prototype.isPrototypeOf(n) ? Array.from(n) : n).flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) toggle(ele);
				else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) toggle(e);
				else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) toggle(n);
			}
			function toggle(node) {
				if (node && node.classList) for (let cla of classes) for (let cl of [cla].flat(10).filter(n => n)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.toggle(c, force);
			}
		};
		BDFDB.DOMUtils.containsClass = function (eles, ...classes) {
			if (!eles || !classes) return;
			let all = classes.pop();
			if (typeof all != "boolean") {
				classes.push(all);
				all = true;
			}
			if (!classes.length) return;
			let contained = undefined;
			for (let ele of [eles].map(n => NodeList.prototype.isPrototypeOf(n) ? Array.from(n) : n).flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) contains(ele);
				else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) contains(e);
				else if (typeof ele == "string") for (let c of ele.split(",")) if (c && (c = c.trim())) for (let n of document.querySelectorAll(c)) contains(n);
			}
			return contained;
			function contains(node) {
				if (node && node.classList) for (let cla of classes) if (typeof cla == "string") for (let c of cla.split(" ")) if (c) {
					if (contained === undefined) contained = all;
					if (all && !node.classList.contains(c)) contained = false;
					if (!all && node.classList.contains(c)) contained = true;
				}
			}
		};
		BDFDB.DOMUtils.replaceClass = function (eles, oldclass, newclass) {
			if (!eles || typeof oldclass != "string" || typeof newclass != "string") return;
			for (let ele of [eles].map(n => NodeList.prototype.isPrototypeOf(n) ? Array.from(n) : n).flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) replace(ele);
				else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) replace(e);
				else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) replace(n);
			}
			function replace(node) {
				if (node && node.tagName && node.className) node.className = node.className.replace(new RegExp(oldclass, "g"), newclass).trim();
			}
		};
		BDFDB.DOMUtils.formatClassName = function (...classes) {
			return BDFDB.ArrayUtils.removeCopies(classes.flat(10).filter(n => n).join(" ").split(" ")).join(" ").trim();
		};
		BDFDB.DOMUtils.removeClassFromDOM = function (...classes) {
			for (let c of classes.flat(10).filter(n => n)) if (typeof c == "string") for (let a of c.split(",")) if (a && (a = a.replace(/\.|\s/g, ""))) BDFDB.DOMUtils.removeClass(document.querySelectorAll("." + a), a);
		};
		BDFDB.DOMUtils.show = function (...eles) {
			BDFDB.DOMUtils.toggle(...eles, true);
		};
		BDFDB.DOMUtils.hide = function (...eles) {
			BDFDB.DOMUtils.toggle(...eles, false);
		};
		BDFDB.DOMUtils.toggle = function (...eles) {
			if (!eles) return;
			let force = eles.pop();
			if (typeof force != "boolean") {
				eles.push(force);
				force = undefined;
			}
			if (!eles.length) return;
			for (let ele of eles.flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) toggle(ele);
				else if (NodeList.prototype.isPrototypeOf(ele)) for (let node of ele) toggle(node);
				else if (typeof ele == "string") for (let c of ele.split(",")) if (c && (c = c.trim())) for (let node of document.querySelectorAll(c)) toggle(node);
			}
			function toggle(node) {
				if (!node || !Node.prototype.isPrototypeOf(node)) return;
				let hide = force === undefined ? !BDFDB.DOMUtils.isHidden(node) : !force;
				if (hide) {
					let display = node.style.getPropertyValue("display");
					if (display && display != "none") node.BDFDBhideDisplayState = {
						display: display,
						important: (` ${node.style.cssText} `.split(` display: ${display}`)[1] || "").trim().indexOf("!important") == 0
					};
					node.style.setProperty("display", "none", "important");
				}
				else {
					if (node.BDFDBhideDisplayState) {
						node.style.setProperty("display", node.BDFDBhideDisplayState.display, node.BDFDBhideDisplayState.important ? "important" : "");
						delete node.BDFDBhideDisplayState;
					}
					else node.style.removeProperty("display");
				}
			}
		};
		BDFDB.DOMUtils.isHidden = function (node) {
			if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) return getComputedStyle(node, null).getPropertyValue("display") == "none";
		};
		BDFDB.DOMUtils.remove = function (...eles) {
			for (let ele of eles.flat(10).filter(n => n)) {
				if (Node.prototype.isPrototypeOf(ele)) ele.remove();
				else if (NodeList.prototype.isPrototypeOf(ele)) {
					let nodes = Array.from(ele);
					while (nodes.length) nodes.shift().remove();
				}
				else if (typeof ele == "string") for (let c of ele.split(",")) if (c && (c = c.trim())) {
					let nodes = Array.from(document.querySelectorAll(c));
					while (nodes.length) nodes.shift().remove();
				}
			}
		};
		BDFDB.DOMUtils.create = function (html) {
			if (typeof html != "string" || !html.trim()) return null;
			let template = document.createElement("template");
			try {template.innerHTML = html.replace(/(?<!pre)>[\t\r\n]+<(?!pre)/g, "><");}
			catch (err) {template.innerHTML = html.replace(/>[\t\r\n]+<(?!pre)/g, "><");}
			if (template.content.childNodes.length == 1) return template.content.firstElementChild || template.content.firstChild;
			else {
				let wrapper = document.createElement("span");
				let nodes = Array.from(template.content.childNodes);
				while (nodes.length) wrapper.appendChild(nodes.shift());
				return wrapper;
			}
		};
		BDFDB.DOMUtils.getParent = function (listOrSelector, node) {
			let parent = null;
			if (Node.prototype.isPrototypeOf(node) && listOrSelector) {
				let list = NodeList.prototype.isPrototypeOf(listOrSelector) ? listOrSelector : typeof listOrSelector == "string" ? document.querySelectorAll(listOrSelector) : null;
				if (list) for (let listNode of list) if (listNode.contains(node)) {
					parent = listNode;
					break;
				}
			}
			return parent;
		};
		BDFDB.DOMUtils.setText = function (node, stringOrNode) {
			if (!node || !Node.prototype.isPrototypeOf(node)) return;
			let textnode = node.nodeType == Node.TEXT_NODE ? node : null;
			if (!textnode) for (let child of node.childNodes) if (child.nodeType == Node.TEXT_NODE || BDFDB.DOMUtils.containsClass(child, "BDFDB-textnode")) {
				textnode = child;
				break;
			}
			if (textnode) {
				if (Node.prototype.isPrototypeOf(stringOrNode) && stringOrNode.nodeType != Node.TEXT_NODE) {
					BDFDB.DOMUtils.addClass(stringOrNode, "BDFDB-textnode");
					node.replaceChild(stringOrNode, textnode);
				}
				else if (Node.prototype.isPrototypeOf(textnode) && textnode.nodeType != Node.TEXT_NODE) node.replaceChild(document.createTextNode(stringOrNode), textnode);
				else textnode.textContent = stringOrNode;
			}
			else node.appendChild(Node.prototype.isPrototypeOf(stringOrNode) ? stringOrNode : document.createTextNode(stringOrNode));
		};
		BDFDB.DOMUtils.getText = function (node) {
			if (!node || !Node.prototype.isPrototypeOf(node)) return;
			for (let child of node.childNodes) if (child.nodeType == Node.TEXT_NODE) return child.textContent;
		};
		BDFDB.DOMUtils.getRects = function (node) {
			let rects = {};
			if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
				let hideNode = node;
				while (hideNode) {
					let hidden = BDFDB.DOMUtils.isHidden(hideNode);
					if (hidden) {
						BDFDB.DOMUtils.toggle(hideNode, true);
						hideNode.BDFDBgetRectsHidden = true;
					}
					hideNode = hideNode.parentElement;
				}
				rects = node.getBoundingClientRect();
				hideNode = node;
				while (hideNode) {
					if (hideNode.BDFDBgetRectsHidden) {
						BDFDB.DOMUtils.toggle(hideNode, false);
						delete hideNode.BDFDBgetRectsHidden;
					}
					hideNode = hideNode.parentElement;
				}
			}
			return rects;
		};
		BDFDB.DOMUtils.getHeight = function (node) {
			if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
				let rects = BDFDB.DOMUtils.getRects(node);
				let style = getComputedStyle(node);
				return rects.height + parseInt(style.marginTop) + parseInt(style.marginBottom);
			}
			return 0;
		};
		BDFDB.DOMUtils.getInnerHeight = function (node) {
			if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
				let rects = BDFDB.DOMUtils.getRects(node);
				let style = getComputedStyle(node);
				return rects.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom);
			}
			return 0;
		};
		BDFDB.DOMUtils.getWidth = function (node) {
			if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
				let rects = BDFDB.DOMUtils.getRects(node);
				let style = getComputedStyle(node);
				return rects.width + parseInt(style.marginLeft) + parseInt(style.marginRight);
			}
			return 0;
		};
		BDFDB.DOMUtils.getInnerWidth = function (node) {
			if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
				let rects = BDFDB.DOMUtils.getRects(node);
				let style = getComputedStyle(node);
				return rects.width - parseInt(style.paddingLeft) - parseInt(style.paddingRight);
			}
			return 0;
		};
		BDFDB.DOMUtils.appendWebScript = function (url, container) {
			if (typeof url != "string") return;
			if (!container && !document.head.querySelector("bd-head bd-scripts")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-scripts></bd-scripts></bd-head>`));
			container = container || document.head.querySelector("bd-head bd-scripts") || document.head;
			container = Node.prototype.isPrototypeOf(container) ? container : document.head;
			BDFDB.DOMUtils.removeWebScript(url, container);
			let script = document.createElement("script");
			script.src = url;
			container.appendChild(script);
		};
		BDFDB.DOMUtils.removeWebScript = function (url, container) {
			if (typeof url != "string") return;
			container = container || document.head.querySelector("bd-head bd-scripts") || document.head;
			container = Node.prototype.isPrototypeOf(container) ? container : document.head;
			BDFDB.DOMUtils.remove(container.querySelectorAll(`script[src="${url}"]`));
		};
		BDFDB.DOMUtils.appendWebStyle = function (url, container) {
			if (typeof url != "string") return;
			if (!container && !document.head.querySelector("bd-head bd-styles")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-styles></bd-styles></bd-head>`));
			container = container || document.head.querySelector("bd-head bd-styles") || document.head;
			container = Node.prototype.isPrototypeOf(container) ? container : document.head;
			BDFDB.DOMUtils.removeWebStyle(url, container);
			container.appendChild(BDFDB.DOMUtils.create(`<link type="text/css" rel="stylesheet" href="${url}"></link>`));
		};
		BDFDB.DOMUtils.removeWebStyle = function (url, container) {
			if (typeof url != "string") return;
			container = container || document.head.querySelector("bd-head bd-styles") || document.head;
			container = Node.prototype.isPrototypeOf(container) ? container : document.head;
			BDFDB.DOMUtils.remove(container.querySelectorAll(`link[href="${url}"]`));
		};
		BDFDB.DOMUtils.appendLocalStyle = function (id, css, container) {
			if (typeof id != "string" || typeof css != "string") return;
			if (!container && !document.head.querySelector("bd-head bd-styles")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-styles></bd-styles></bd-head>`));
			container = container || document.head.querySelector("bd-head bd-styles") || document.head;
			container = Node.prototype.isPrototypeOf(container) ? container : document.head;
			BDFDB.DOMUtils.removeLocalStyle(id, container);
			container.appendChild(BDFDB.DOMUtils.create(`<style id="${id}CSS">${css.replace(/\t|\r|\n/g,"")}</style>`));
		};
		BDFDB.DOMUtils.removeLocalStyle = function (id, container) {
			if (typeof id != "string") return;
			container = container || document.head.querySelector("bd-head bd-styles") || document.head;
			container = Node.prototype.isPrototypeOf(container) ? container : document.head;
			BDFDB.DOMUtils.remove(container.querySelectorAll(`style[id="${id}CSS"]`));
		};
		
		BDFDB.ModalUtils = {};
		BDFDB.ModalUtils.open = function (plugin, config) {
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(config)) return;
			let modalInstance, modalProps, cancels = [], closeModal = _ => {
				if (BDFDB.ObjectUtils.is(modalProps) && typeof modalProps.onClose == "function") modalProps.onClose();
			};
			
			let titleChildren = [], headerChildren = [], contentChildren = [], footerChildren = [];
			
			if (typeof config.text == "string") {
				config.contentClassName = BDFDB.DOMUtils.formatClassName(config.contentClassName, BDFDB.disCN.modaltextcontent);
				contentChildren.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextElement, {
					children: config.text
				}));
			}
			
			if (config.children) {
				let tabBarItems = [], tabIns = {};
				for (let child of [config.children].flat(10).filter(n => n)) if (Internal.LibraryModules.React.isValidElement(child)) {
					if (child.type == Internal.LibraryComponents.ModalComponents.ModalTabContent) {
						if (!tabBarItems.length) child.props.open = true;
						else delete child.props.open;
						let ref = typeof child.ref == "function" ? child.ref : (_ => {});
						child.ref = instance => {
							ref(instance);
							if (instance) tabIns[child.props.tab] = instance;
						};
						tabBarItems.push({value: child.props.tab});
					}
					contentChildren.push(child);
				}
				if (tabBarItems.length) headerChildren.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
					className: BDFDB.disCN.tabbarcontainer,
					align: Internal.LibraryComponents.Flex.Align.CENTER,
					children: [
						BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TabBar, {
							className: BDFDB.disCN.tabbar,
							itemClassName: BDFDB.disCN.tabbaritem,
							type: Internal.LibraryComponents.TabBar.Types.TOP,
							items: tabBarItems,
							onItemSelect: value => {
								for (let key in tabIns) {
									if (key == value) tabIns[key].props.open = true;
									else delete tabIns[key].props.open;
								}
								BDFDB.ReactUtils.forceUpdate(BDFDB.ObjectUtils.toArray(tabIns));
							}
						}),
						config.tabBarChildren
					].flat(10).filter(n => n)
				}));
			}
			
			if (BDFDB.ArrayUtils.is(config.buttons)) for (let button of config.buttons) {
				let contents = typeof button.contents == "string" && button.contents;
				if (contents) {
					let color = typeof button.color == "string" && Internal.LibraryComponents.Button.Colors[button.color.toUpperCase()];
					let look = typeof button.look == "string" && Internal.LibraryComponents.Button.Looks[button.look.toUpperCase()];
					let click = typeof button.click == "function" ? button.click : (typeof button.onClick == "function" ? button.onClick : _ => {});
					
					if (button.cancel) cancels.push(click);
					
					footerChildren.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Button, BDFDB.ObjectUtils.exclude(Object.assign({}, button, {
						look: look || (color ? Internal.LibraryComponents.Button.Looks.FILLED : Internal.LibraryComponents.Button.Looks.LINK),
						color: color || Internal.LibraryComponents.Button.Colors.PRIMARY,
						onClick: _ => {
							if (button.close) closeModal();
							if (!(button.close && button.cancel)) click(modalInstance);
						},
						children: contents
					}), "click", "close", "cancel", "contents")));
				}
			}
			
			contentChildren = contentChildren.concat(config.contentChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
			titleChildren = titleChildren.concat(config.titleChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
			headerChildren = headerChildren.concat(config.headerChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
			footerChildren = footerChildren.concat(config.footerChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
			
			if (contentChildren.length) {
				if (typeof config.onOpen != "function") config.onOpen = _ => {};
				if (typeof config.onClose != "function") config.onClose = _ => {};
				
				let name = plugin.name || (typeof plugin.getName == "function" ? plugin.getName() : null);
				name = typeof name == "string" ? name : null;
				let oldTransitionState = 0;
				Internal.LibraryModules.ModalUtils.openModal(props => {
					modalProps = props;
					return BDFDB.ReactUtils.createElement(class BDFDB_Modal extends Internal.LibraryModules.React.Component {
						render() {
							return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ModalComponents.ModalRoot, {
								className: BDFDB.DOMUtils.formatClassName(name && `${name}-modal`, BDFDB.disCN.modalwrapper, config.className),
								size: typeof config.size == "string" && Internal.LibraryComponents.ModalComponents.ModalSize[config.size.toUpperCase()] || Internal.LibraryComponents.ModalComponents.ModalSize.SMALL,
								transitionState: props.transitionState,
								children: [
									BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ModalComponents.ModalHeader, {
										className: BDFDB.DOMUtils.formatClassName(config.headerClassName, config.shade && BDFDB.disCN.modalheadershade, headerChildren.length && BDFDB.disCN.modalheaderhassibling),
										separator: config.headerSeparator || false,
										children: [
											BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
												children: [
													BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormTitle, {
														tag: Internal.LibraryComponents.FormComponents.FormTitle.Tags.H4,
														children: config.header
													}),
													BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextElement, {
														size: Internal.LibraryComponents.TextElement.Sizes.SIZE_12,
														children: typeof config.subHeader == "string" || BDFDB.ReactUtils.isValidElement(config.subHeader) ? config.subHeader : (name || "")
													})
												]
											}),
											titleChildren,
											BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ModalComponents.ModalCloseButton, {
												onClick: closeModal
											})
										].flat(10).filter(n => n)
									}),
									headerChildren.length ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
										grow: 0,
										shrink: 0,
										children: headerChildren
									}) : null,
									BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ModalComponents.ModalContent, {
										className: config.contentClassName,
										scroller: config.scroller,
										direction: config.direction,
										content: config.content,
										children: contentChildren
									}),
									footerChildren.length ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ModalComponents.ModalFooter, {
										className: config.footerClassName,
										direction: config.footerDirection,
										children: footerChildren
									}) : null
								]
							});
						}
						componentDidMount() {
							modalInstance = this;
							if (props.transitionState == 1 && props.transitionState > oldTransitionState) config.onOpen(modalInstance);
							oldTransitionState = props.transitionState;
						}
						componentWillUnmount() {
							if (props.transitionState == 3) {
								for (let cancel of cancels) cancel(modalInstance);
								config.onClose(modalInstance);
							}
						}
					}, props, true);
				}, {
					onCloseRequest: closeModal
				});
			}
		};
		BDFDB.ModalUtils.confirm = function (plugin, text, callback) {
			if (!BDFDB.ObjectUtils.is(plugin) || typeof text != "string") return;
			BDFDB.ModalUtils.open(plugin, {
				text: text,
				header: BDFDB.LanguageUtils.LibraryStrings.confirm,
				className: BDFDB.disCN.modalconfirmmodal,
				scroller: false,
				buttons: [
					{contents: BDFDB.LanguageUtils.LanguageStrings.OKAY, close: true, color: "RED", onClick: callback},
					{contents: BDFDB.LanguageUtils.LanguageStrings.CANCEL, close: true}
				]
			});
		};
	
		const RealMenuItems = BDFDB.ModuleUtils.findByProperties("MenuItem", "MenuGroup");
		BDFDB.ContextMenuUtils = {};
		BDFDB.ContextMenuUtils.open = function (plugin, e, children) {
			Internal.LibraryModules.ContextMenuUtils.openContextMenu(e, _ => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Menu, {
				navId: "bdfdb-context",
				onClose: Internal.LibraryModules.ContextMenuUtils.closeContextMenu,
				children: children
			}, true));
		};
		BDFDB.ContextMenuUtils.close = function (nodeOrInstance) {
			if (!BDFDB.ObjectUtils.is(nodeOrInstance)) return;
			let instance = BDFDB.ReactUtils.findOwner(nodeOrInstance, {props: "closeContextMenu", up: true});
			if (BDFDB.ObjectUtils.is(instance) && instance.props && typeof instance.props.closeContextMenu == "function") instance.props.closeContextMenu();
			else Internal.LibraryModules.ContextMenuUtils.closeContextMenu();
		};
		BDFDB.ContextMenuUtils.createItem = function (component, props = {}) {
			if (!component) return null;
			else {
				if (props.render || props.persisting || BDFDB.ObjectUtils.is(props.popoutProps) || (typeof props.color == "string" && !DiscordClasses[`menu${props.color.toLowerCase()}`])) component = Internal.MenuItem;
				if (BDFDB.ObjectUtils.toArray(RealMenuItems).some(c => c == component)) return BDFDB.ReactUtils.createElement(component, props);
				else return BDFDB.ReactUtils.createElement(RealMenuItems.MenuItem, {
					id: props.id,
					disabled: props.disabled,
					customItem: true,
					render: menuItemProps => {
						if (!props.state) props.state = BDFDB.ObjectUtils.extract(props, "checked", "value");
						return BDFDB.ReactUtils.createElement(Internal.CustomMenuItemWrapper, {
							disabled: props.disabled,
							childProps: Object.assign({}, props, menuItemProps, {color: props.color}),
							children: component
						}, true);
					}
				});
			}
		};
		BDFDB.ContextMenuUtils.createItemId = function (...strings) {
			return strings.map(s => typeof s == "number" ? s.toString() : s).filter(s => typeof s == "string").map(s => s.toLowerCase().replace(/\s/, "-")).join("-");
		};
		BDFDB.ContextMenuUtils.findItem = function (returnvalue, config) {
			if (!returnvalue || !BDFDB.ObjectUtils.is(config) || !config.label && !config.id) return [null, -1];
			config.label = config.label && [config.label].flat().filter(n => n);
			config.id = config.id && [config.id].flat().filter(n => n);
			let contextMenu = BDFDB.ReactUtils.findChild(returnvalue, {props: "navId"}) || (BDFDB.ArrayUtils.is(returnvalue) ? {props: {children: returnvalue}} : null);
			if (contextMenu) {
				for (let i in contextMenu.props.children) {
					if (contextMenu.props.children[i] && contextMenu.props.children[i].type == RealMenuItems.MenuGroup) {
						if (BDFDB.ArrayUtils.is(contextMenu.props.children[i].props.children)) {
							for (let j in contextMenu.props.children[i].props.children) if (check(contextMenu.props.children[i].props.children[j])) {
								if (config.group) return [contextMenu.props.children, parseInt(i)];
								else return [contextMenu.props.children[i].props.children, parseInt(j)];
							}
						}
						else if (contextMenu.props.children[i] && contextMenu.props.children[i].props) {
							if (check(contextMenu.props.children[i].props.children)) {
								if (config.group) return [contextMenu.props.children, parseInt(i)];
								else {
									contextMenu.props.children[i].props.children = [contextMenu.props.children[i].props.children];
									return [contextMenu.props.children[i].props.children, 0];
								}
							}
							else if (contextMenu.props.children[i].props.children && contextMenu.props.children[i].props.children.props && BDFDB.ArrayUtils.is(contextMenu.props.children[i].props.children.props.children)) {
								for (let j in contextMenu.props.children[i].props.children.props.children) if (check(contextMenu.props.children[i].props.children.props.children[j])) {
									if (config.group) return [contextMenu.props.children, parseInt(i)];
									else return [contextMenu.props.children[i].props.children.props.children, parseInt(j)];
								}
							}
						}
					}
					else if (check(contextMenu.props.children[i])) return [contextMenu.props.children, parseInt(i)];
				}
				return [contextMenu.props.children, -1];
			}
			return [null, -1];
			function check (child) {
				if (!child) return false;
				let props = child.stateNode ? child.stateNode.props : child.props;
				if (!props) return false;
				return config.id && config.id.some(key => props.id == key) || config.label && config.label.some(key => props.label == key);
			}
		};

		BDFDB.StringUtils = {};
		BDFDB.StringUtils.htmlEscape = function (string) {
			let ele = document.createElement("div");
			ele.innerText = string;
			return ele.innerHTML;
		};
		BDFDB.StringUtils.regEscape = function (string) {
			return typeof string == "string" && string.replace(/([\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}])/g, "\\$1");
		};
		BDFDB.StringUtils.insertNRST = function (string) {
			return typeof string == "string" && string.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\s/g, " ");
		};
		BDFDB.StringUtils.highlight = function (string, searchstring, prefix = `<span class="${BDFDB.disCN.highlight}">`, suffix = `</span>`) {
			if (typeof string != "string" || !searchstring || searchstring.length < 1) return string;
			let offset = 0, original = string;
			BDFDB.ArrayUtils.getAllIndexes(string.toUpperCase(), searchstring.toUpperCase()).forEach(index => {
				let d1 = offset * (prefix.length + suffix.length);
				index = index + d1;
				let d2 = index + searchstring.length;
				let d3 = [-1].concat(BDFDB.ArrayUtils.getAllIndexes(string.substring(0, index), "<"));
				let d4 = [-1].concat(BDFDB.ArrayUtils.getAllIndexes(string.substring(0, index), ">"));
				if (d3[d3.length - 1] > d4[d4.length - 1]) return;
				string = string.substring(0, index) + prefix + string.substring(index, d2) + suffix + string.substring(d2);
				offset++;
			});
			return string || original;
		};
		BDFDB.StringUtils.findMatchCaseless = function (match, string, any) {
			if (typeof match != "string" || typeof string != "string" || !match || !string) return "";
			match = BDFDB.StringUtils.regEscape(match);
			let exec = (new RegExp(any ? `([\\n\\r\\s]+${match})|(^${match})` : `([\\n\\r\\s]+${match}[\\n\\r\\s]+)|([\\n\\r\\s]+${match}$)|(^${match}[\\n\\r\\s]+)|(^${match}$)`, "i")).exec(string);
			return exec && typeof exec[0] == "string" && exec[0].replace(/[\n\r\s]/g, "") || "";
		};
		BDFDB.StringUtils.equalCase = function (match, string) {
			if (typeof match != "string" || typeof string != "string") return "";
			let first = match.charAt(0);
			return first != first.toUpperCase() ? (string.charAt(0).toLowerCase() + string.slice(1)) : first != first.toLowerCase() ? (string.charAt(0).toUpperCase() + string.slice(1)) : string;
		};
		BDFDB.StringUtils.extractSelection = function (original, selection) {
			if (typeof original != "string") return "";
			if (typeof selection != "string") return original;
			let s = [], f = [], wrong = 0, canceled = false, done = false;
			for (let i of BDFDB.ArrayUtils.getAllIndexes(original, selection[0])) if (!done) {
				while (i <= original.length && !done) {
					let subSelection = selection.slice(s.filter(n => n != undefined).length);
					if (!subSelection && s.length - 20 <= selection.length) done = true;
					else for (let j in subSelection) if (!done && !canceled) {
						if (original[i] == subSelection[j]) {
							s[i] = subSelection[j];
							f[i] = subSelection[j];
							wrong = 0;
							if (i == original.length) done = true;
						}
						else {
							s[i] = null;
							f[i] = original[i];
							wrong++;
							if (wrong > 4) {
								s = [], f = [], wrong = 0, canceled = true;
								break;
							}
						}
						break;
					}
					canceled = false;
					i++;
				}
			}
			if (s.filter(n => n).length) {
				let reverseS = [].concat(s).reverse(), i = 0, j = 0;
				for (let k in s) {
					if (s[k] == null) i = parseInt(k) + 1;
					else break;
				}
				for (let k in reverseS) {
					if (reverseS[k] == null) j = parseInt(k) + 1;
					else break;
				}
				return f.slice(i, f.length - j).join("");
			}
			else return original;
		};
		
		BDFDB.SlateUtils = {};
		BDFDB.SlateUtils.isRichValue = function (richValue) {
			return richValue && typeof richValue == "object" && BDFDB.SlateUtils.toRichValue("").constructor.prototype.isPrototypeOf(richValue);
		};
		BDFDB.SlateUtils.toTextValue = function (richValue) {
			return BDFDB.SlateUtils.isRichValue(richValue) ? Internal.LibraryModules.SlateTextUtils.toTextValue(richValue) : "";
		};
		BDFDB.SlateUtils.toRichValue = function (string) {
			return typeof string == "string" ? Internal.LibraryModules.SlateRichUtils.toRichValue(string) : null;
		};
		
		BDFDB.NumberUtils = {};
		BDFDB.NumberUtils.formatBytes = function (bytes, sigDigits) {
			bytes = parseInt(bytes);
			if (isNaN(bytes) || bytes < 0) return "0 Bytes";
			if (bytes == 1) return "1 Byte";
			let size = Math.floor(Math.log(bytes) / Math.log(1024));
			return parseFloat((bytes / Math.pow(1024, size)).toFixed(sigDigits < 1 ? 0 : sigDigits > 20 ? 20 : sigDigits || 2)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][size];
		};
		BDFDB.NumberUtils.mapRange = function (from, to, value) {
			if (parseFloat(value) < parseFloat(from[0])) return parseFloat(to[0]);
			else if (parseFloat(value) > parseFloat(from[1])) return parseFloat(to[1]);
			else return parseFloat(to[0]) + (parseFloat(value) - parseFloat(from[0])) * (parseFloat(to[1]) - parseFloat(to[0])) / (parseFloat(from[1]) - parseFloat(from[0]));
		};
		BDFDB.NumberUtils.generateId = function (array) {
			array = BDFDB.ArrayUtils.is(array) ? array : [];
			let id = Math.floor(Math.random() * 10000000000000000);
			if (array.includes(id)) return BDFDB.NumberUtils.generateId(array);
			else {
				array.push(id);
				return id;
			}
		};
		BDFDB.NumberUtils.compareVersions = function (newV, oldV) {
			if (!newV || !oldV) return true;
			newV = newV.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
			oldV = oldV.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
			let length = Math.max(newV.length, oldV.length);
			if (!length) return true;
			if (newV.length > oldV.length) {
				let tempArray = new Array(newV.length - oldV.length);
				for (let i = 0; i < tempArray.length; i++) tempArray[i] = 0;
				oldV = tempArray.concat(oldV);
			}
			else if (newV.length < oldV.length) {
				let tempArray = new Array(oldV.length - newV.length);
				for (let i = 0; i < tempArray.length; i++) tempArray[i] = 0;
				newV = tempArray.concat(newV);
			}
			for (let i = 0; i < length; i++) for (let iOutdated = false, j = 0; j <= i; j++) {
				if (j == i && newV[j] < oldV[j]) return false;
				if (j < i) iOutdated = newV[j] == oldV[j];
				if ((j == 0 || iOutdated) && j == i && newV[j] > oldV[j]) return true;
			}
			return false;
		};
		BDFDB.NumberUtils.getVersionDifference = function (newV, oldV) {
			if (!newV || !oldV) return false;
			newV = newV.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
			oldV = oldV.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
			let length = Math.max(newV.length, oldV.length);
			if (!length) return false;
			if (newV.length > oldV.length) {
				let tempArray = new Array(newV.length - oldV.length);
				for (let i = 0; i < tempArray.length; i++) tempArray[i] = 0;
				oldV = tempArray.concat(oldV);
			}
			else if (newV.length < oldV.length) {
				let tempArray = new Array(oldV.length - newV.length);
				for (let i = 0; i < tempArray.length; i++) tempArray[i] = 0;
				newV = tempArray.concat(newV);
			}
			let oldValue = 0, newValue = 0;
			for (let i in oldV.reverse()) oldValue += (oldV[i] * (10 ** i));
			for (let i in newV.reverse()) newValue += (newV[i] * (10 ** i));
			return (newValue - oldValue) / (10 ** (length-1));
		};

		BDFDB.DiscordUtils = {};
		BDFDB.DiscordUtils.openLink = function (url, config = {}) {
			if ((config.inBuilt || config.inBuilt === undefined && Internal.settings.general.useChromium) && Internal.LibraryRequires.electron && Internal.LibraryRequires.electron.remote) {
				let browserWindow = new Internal.LibraryRequires.electron.remote.BrowserWindow({
					frame: true,
					resizeable: true,
					show: true,
					darkTheme: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themedark,
					webPreferences: {
						nodeIntegration: false,
						nodeIntegrationInWorker: false
					}
				});
				browserWindow.setMenu(null);
				browserWindow.loadURL(url);
				if (config.minimized) browserWindow.minimize(null);
			}
			else window.open(url, "_blank");
		};
		window.DiscordNative && window.DiscordNative.app && window.DiscordNative.app.getPath("appData").then(path => {BDFDB.DiscordUtils.getFolder.base = path;});
		BDFDB.DiscordUtils.getFolder = function () {
			if (!BDFDB.DiscordUtils.getFolder.base) return "";
			else if (BDFDB.DiscordUtils.getFolder.folder) return BDFDB.DiscordUtils.getFolder.folder;
			else {
				let folder;
				try {
					let build = BDFDB.DiscordUtils.getBuild();
					build = "discord" + (build == "stable" ? "" : build);
					folder = Internal.LibraryRequires.path.resolve(BDFDB.DiscordUtils.getFolder.base, build, BDFDB.DiscordUtils.getVersion());
				} 
				catch (err) {folder = BDFDB.DiscordUtils.getFolder.base;}
				return BDFDB.DiscordUtils.getFolder.folder = folder;
			}
		};
		BDFDB.DiscordUtils.getBuild = function () {
			if (BDFDB.DiscordUtils.getBuild.build) return BDFDB.DiscordUtils.getBuild.build;
			else {
				let build;
				try {build = window.DiscordNative.app.getReleaseChannel();} 
				catch (err) {
					let version = BDFDB.DiscordUtils.getVersion();
					if (version) {
						version = version.split(".");
						if (version.length == 3 && !isNaN(version = parseInt(version[2]))) build = version > 300 ? "stable" : version > 200 ? "canary" : "ptb";
						else build = "stable";
					}
					else build = "stable";
				}
				return BDFDB.DiscordUtils.getBuild.build = build;
			}
		};
		BDFDB.DiscordUtils.getVersion = function () {
			if (BDFDB.DiscordUtils.getVersion.version) return BDFDB.DiscordUtils.getVersion.version;
			else {
				let version;
				try {version = window.DiscordNative.app.getVersion();}
				catch (err) {version = "999.999.9999";}
				return BDFDB.DiscordUtils.getVersion.version = version;
			}
		};
		BDFDB.DiscordUtils.isDevModeEnabled = function () {
			return BDFDB.DiscordUtils.getSettings("developerMode");
		};
		BDFDB.DiscordUtils.getExperiment = function (id) {
			if (!id) return null;
			const module = BDFDB.ModuleUtils.find(m => m.definition && m.definition.defaultConfig && m.definition.defaultConfig[id] != null && typeof m.getCurrentConfig == "function" && m);
			return module && (module.getCurrentConfig({}) || {})[id];
		};
		BDFDB.DiscordUtils.getTheme = function () {
			return BDFDB.DiscordUtils.getSettings("theme") != "dark" ? BDFDB.disCN.themelight : BDFDB.disCN.themedark;
		};
		BDFDB.DiscordUtils.getMode = function () {
			return BDFDB.DiscordUtils.getSettings("messageDisplayCompact") ? "compact" : "cozy";
		};
		BDFDB.DiscordUtils.getSettings = function (key) {
			if (!key) return null;
			else if (Internal.LibraryModules.SettingsUtils && (Internal.LibraryModules.SettingsUtils[key] || Internal.LibraryModules.SettingsUtils[key + "DoNotUseYet"])) return (Internal.LibraryModules.SettingsUtils[key] || Internal.LibraryModules.SettingsUtils[key + "DoNotUseYet"]).getSetting();
			else {
				const value = Internal.LibraryModules.SettingsStore.getAllSettings()[key.slice(0, 1).toLowerCase() + key.slice(1)];
				return value != undefined ? value: null;
			}
		};
		BDFDB.DiscordUtils.setSettings = function (key, value) {
			if (!key) return;
			else if (Internal.LibraryModules.SettingsUtils && (Internal.LibraryModules.SettingsUtils[key] || Internal.LibraryModules.SettingsUtils[key + "DoNotUseYet"])) (Internal.LibraryModules.SettingsUtils[key] || Internal.LibraryModules.SettingsUtils[key + "DoNotUseYet"]).updateSetting(value);
			else Internal.LibraryModules.SettingsUtilsOld.updateRemoteSettings({[key.slice(0, 1).toLowerCase() + key.slice(1)]: value});
		};
		BDFDB.DiscordUtils.getZoomFactor = function () {
			let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
			let widthZoom = Math.round(100 * window.outerWidth / aRects.width);
			let heightZoom = Math.round(100 * window.outerHeight / aRects.height);
			return widthZoom < heightZoom ? widthZoom : heightZoom;
		};
		BDFDB.DiscordUtils.getFontScale = function () {
			return parseInt(document.firstElementChild.style.fontSize.replace("%", ""));
		};
		BDFDB.DiscordUtils.shake = function () {
			BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.appcontainer), {name: "Shakeable", unlimited: true, up: true}).shake();
		};
		BDFDB.DiscordUtils.rerenderAll = function (instant) {
			BDFDB.TimeUtils.clear(BDFDB.DiscordUtils.rerenderAll.timeout);
			BDFDB.DiscordUtils.rerenderAll.timeout = BDFDB.TimeUtils.timeout(_ => {
				let ShakeableIns = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.appcontainer), {name: "Shakeable", unlimited: true, up: true});
				let ShakeablePrototype = BDFDB.ObjectUtils.get(ShakeableIns, `${BDFDB.ReactUtils.instanceKey}.type.prototype`);
				if (ShakeableIns && ShakeablePrototype) {
					BDFDB.PatchUtils.patch({name: "BDFDB DiscordUtils"}, ShakeablePrototype, "render", {after: e => {
						e.returnValue.props.children = typeof e.returnValue.props.children == "function" ? (_ => {return null;}) : [];
						BDFDB.ReactUtils.forceUpdate(ShakeableIns);
					}}, {once: true});
					BDFDB.ReactUtils.forceUpdate(ShakeableIns);
				}
			}, instant ? 0 : 1000);
		};

		BDFDB.WindowUtils = {};
		BDFDB.WindowUtils.open = function (plugin, url, config = {}) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !url || !Internal.LibraryRequires.electron || !Internal.LibraryRequires.electron.remote) return;
			if (!BDFDB.ArrayUtils.is(plugin.browserWindows)) plugin.browserWindows = [];
			config = Object.assign({
				show: false,
				webPreferences: {
					nodeIntegration: true,
					nodeIntegrationInWorker: true
				}
			}, config);
			let browserWindow = new Internal.LibraryRequires.electron.remote.BrowserWindow(BDFDB.ObjectUtils.exclude(config, "showOnReady", "onLoad"));
			
			if (!config.show && config.showOnReady) browserWindow.once("ready-to-show", browserWindow.show);
			if (config.devTools) browserWindow.openDevTools();
			if (typeof config.onLoad == "function") browserWindow.webContents.on("did-finish-load", (...args) => {config.onLoad(...args);});
			if (typeof config.onClose == "function") browserWindow.once("closed", (...args) => {config.onClose(...args);});
			
			if (typeof browserWindow.removeMenu == "function") browserWindow.removeMenu();
			else browserWindow.setMenu(null);
			browserWindow.loadURL(url);
			browserWindow.executeJavaScriptSafe = js => {if (!browserWindow.isDestroyed()) browserWindow.webContents.executeJavaScript(`(_ => {${js}})();`);};
			plugin.browserWindows.push(browserWindow);
			return browserWindow;
		};
		BDFDB.WindowUtils.close = function (browserWindow) {
			if (BDFDB.ObjectUtils.is(browserWindow) && !browserWindow.isDestroyed() && browserWindow.isClosable()) browserWindow.close();
		};
		BDFDB.WindowUtils.closeAll = function (plugin) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.browserWindows)) return;
			while (plugin.browserWindows.length) BDFDB.WindowUtils.close(plugin.browserWindows.pop());
		};
		BDFDB.WindowUtils.addListener = function (plugin, actions, callback) {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !actions || typeof callback != "function") return;
			BDFDB.WindowUtils.removeListener(plugin, actions);
			for (let action of actions.split(" ")) {
				action = action.split(".");
				let eventName = action.shift();
				if (!eventName) return;
				let namespace = (action.join(".") || "") + plugin.name;
				if (!BDFDB.ArrayUtils.is(plugin.ipcListeners)) plugin.ipcListeners = [];

				plugin.ipcListeners.push({eventName, namespace, callback});
				Internal.LibraryRequires.electron.ipcRenderer.on(eventName, callback);
			}
		};
		BDFDB.WindowUtils.removeListener = function (plugin, actions = "") {
			plugin = plugin == BDFDB && Internal || plugin;
			if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.ipcListeners)) return;
			if (actions) {
				for (let action of actions.split(" ")) {
					action = action.split(".");
					let eventName = action.shift();
					let namespace = (action.join(".") || "") + plugin.name;
					for (let listener of plugin.ipcListeners) {
						let removedListeners = [];
						if (listener.eventName == eventName && listener.namespace == namespace) {
							Internal.LibraryRequires.electron.ipcRenderer.off(listener.eventName, listener.callback);
							removedListeners.push(listener);
						}
						if (removedListeners.length) plugin.ipcListeners = plugin.ipcListeners.filter(listener => {return removedListeners.indexOf(listener) < 0;});
					}
				}
			}
			else {
				for (let listener of plugin.ipcListeners) Internal.LibraryRequires.electron.ipcRenderer.off(listener.eventName, listener.callback);
				plugin.ipcListeners = [];
			}
		};
		
		const DiscordClassModules = Object.assign({}, InternalData.CustomClassModules);
		Internal.DiscordClassModules = new Proxy(DiscordClassModules, {
			get: function (_, item) {
				if (DiscordClassModules[item]) return DiscordClassModules[item];
				if (!InternalData.DiscordClassModules[item]) return;
				DiscordClassModules[item] = BDFDB.ModuleUtils.findStringObject(InternalData.DiscordClassModules[item].props, Object.assign({}, InternalData.DiscordClassModules[item]));
				return DiscordClassModules[item] ? DiscordClassModules[item] : undefined;
			}
		});
		BDFDB.DiscordClassModules = Internal.DiscordClassModules;
		
		const DiscordClasses = Object.assign({}, InternalData.DiscordClasses);
		BDFDB.DiscordClasses = Object.assign({}, DiscordClasses);
		Internal.getDiscordClass = function (item, selector) {
			let className, fallbackClassName;
			className = fallbackClassName = Internal.DiscordClassModules.BDFDB.BDFDBundefined + "-" + Internal.generateClassId();
			if (DiscordClasses[item] === undefined) {
				BDFDB.LogUtils.warn([item, "not found in DiscordClasses"]);
				return className;
			} 
			else if (!BDFDB.ArrayUtils.is(DiscordClasses[item]) || DiscordClasses[item].length != 2) {
				BDFDB.LogUtils.warn([item, "is not an Array of Length 2 in DiscordClasses"]);
				return className;
			}
			else if (Internal.DiscordClassModules[DiscordClasses[item][0]] === undefined) {
				BDFDB.LogUtils.warn([DiscordClasses[item][0], "not found in DiscordClassModules"]);
				return className;
			}
			else if ([DiscordClasses[item][1]].flat().every(prop => Internal.DiscordClassModules[DiscordClasses[item][0]][prop] === undefined)) {
				BDFDB.LogUtils.warn([DiscordClasses[item][1], "not found in", DiscordClasses[item][0], "in DiscordClassModules"]);
				return className;
			}
			else {
				for (let prop of [DiscordClasses[item][1]].flat()) {
					className = Internal.DiscordClassModules[DiscordClasses[item][0]][prop];
					if (className) break;
					else className = fallbackClassName;
				}
				if (selector) {
					className = className.split(" ").filter(n => n.indexOf("da-") != 0).join(selector ? "." : " ");
					className = className || fallbackClassName;
				}
				return BDFDB.ArrayUtils.removeCopies(className.split(" ")).join(" ") || fallbackClassName;
			}
		};
		const generationChars = "0123456789ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
		Internal.generateClassId = function () {
			let id = "";
			while (id.length < 6) id += generationChars[Math.floor(Math.random() * generationChars.length)];
			return id;
		};
		BDFDB.disCN = new Proxy(DiscordClasses, {
			get: function (list, item) {
				return Internal.getDiscordClass(item, false).replace("#", "");
			}
		});
		BDFDB.disCNS = new Proxy(DiscordClasses, {
			get: function (list, item) {
				return Internal.getDiscordClass(item, false).replace("#", "") + " ";
			}
		});
		BDFDB.disCNC = new Proxy(DiscordClasses, {
			get: function (list, item) {
				return Internal.getDiscordClass(item, false).replace("#", "") + ",";
			}
		});
		BDFDB.dotCN = new Proxy(DiscordClasses, {
			get: function (list, item) {
				let className = Internal.getDiscordClass(item, true);
				return (className.indexOf("#") == 0 ? "" : ".") + className;
			}
		});
		BDFDB.dotCNS = new Proxy(DiscordClasses, {
			get: function (list, item) {
				let className = Internal.getDiscordClass(item, true);
				return (className.indexOf("#") == 0 ? "" : ".") + className + " ";
			}
		});
		BDFDB.dotCNC = new Proxy(DiscordClasses, {
			get: function (list, item) {
				let className = Internal.getDiscordClass(item, true);
				return (className.indexOf("#") == 0 ? "" : ".") + className + ",";
			}
		});
		BDFDB.notCN = new Proxy(DiscordClasses, {
			get: function (list, item) {
				return `:not(.${Internal.getDiscordClass(item, true).split(".")[0]})`;
			}
		});
		BDFDB.notCNS = new Proxy(DiscordClasses, {
			get: function (list, item) {
				return `:not(.${Internal.getDiscordClass(item, true).split(".")[0]}) `;
			}
		});
		BDFDB.notCNC = new Proxy(DiscordClasses, {
			get: function (list, item) {
				return `:not(.${Internal.getDiscordClass(item, true).split(".")[0]}),`;
			}
		});
	
		const LanguageStrings = Internal.LibraryModules.LanguageStore && Internal.LibraryModules.LanguageStore._proxyContext ? Object.assign({}, Internal.LibraryModules.LanguageStore._proxyContext.defaultMessages) : {};
		const LibraryStrings = Object.assign({}, InternalData.LibraryStrings);
		BDFDB.LanguageUtils = {};
		BDFDB.LanguageUtils.languages = Object.assign({}, InternalData.Languages);
		BDFDB.LanguageUtils.getLanguage = function () {
			let lang = Internal.LibraryModules.LanguageStore.chosenLocale || Internal.LibraryModules.LanguageStore._chosenLocale || BDFDB.DiscordUtils.getSettings("locale") || "en";
			if (lang == "en-GB" || lang == "en-US") lang = "en";
			let langIds = lang.split("-");
			let langId = langIds[0];
			let langId2 = langIds[1] || "";
			lang = langId2 && langId.toUpperCase() !== langId2.toUpperCase() ? langId + "-" + langId2 : langId;
			return BDFDB.LanguageUtils.languages[lang] || BDFDB.LanguageUtils.languages[langId] || BDFDB.LanguageUtils.languages.en;
		};
		BDFDB.LanguageUtils.getName = function (language) {
			if (!language || typeof language.name != "string") return "";
			if (language.name.startsWith("Discord")) return language.name.slice(0, -1) + (language.ownlang && (BDFDB.LanguageUtils.languages[language.id] || {}).name != language.ownlang ? ` / ${language.ownlang}` : "") + ")";
			else return language.name + (language.ownlang && language.name != language.ownlang ? ` / ${language.ownlang}` : "");
		};
		BDFDB.LanguageUtils.LanguageStrings = new Proxy(LanguageStrings, {
			get: function (list, item) {
				let stringObj = Internal.LibraryModules.LanguageStore.Messages[item];
				if (!stringObj) BDFDB.LogUtils.warn([item, "not found in BDFDB.LanguageUtils.LanguageStrings"]);
				else {
					if (stringObj && typeof stringObj == "object" && typeof stringObj.format == "function") return BDFDB.LanguageUtils.LanguageStringsFormat(item);
					else return stringObj;
				}
				return "";
			}
		});
		BDFDB.LanguageUtils.LanguageStringsCheck = new Proxy(LanguageStrings, {
			get: function (list, item) {
				return !!Internal.LibraryModules.LanguageStore.Messages[item];
			}
		});
		let parseLanguageStringObj = obj => {
			let string = "";
			if (typeof obj == "string") string += obj;
			else if (BDFDB.ObjectUtils.is(obj)) {
				if (obj.content) string += parseLanguageStringObj(obj.content);
				else if (obj.children) string += parseLanguageStringObj(obj.children);
				else if (obj.props) string += parseLanguageStringObj(obj.props);
			}
			else if (BDFDB.ArrayUtils.is(obj)) for (let ele of obj) string += parseLanguageStringObj(ele);
			return string;
		};
		BDFDB.LanguageUtils.LanguageStringsFormat = function (item, ...values) {
			if (item) {
				let stringObj = Internal.LibraryModules.LanguageStore.Messages[item];
				if (stringObj && typeof stringObj == "object" && typeof stringObj.format == "function") {
					let i = 0, returnvalue, formatVars = {};
					while (!returnvalue && i < 10) {
						i++;
						try {returnvalue = stringObj.format(formatVars, false);}
						catch (err) {
							returnvalue = null;
							let value = values.shift();
							formatVars[err.toString().split("for: ")[1]] = value != null ? (value === 0 ? "0" : value) : "undefined";
							if (stringObj.intMessage) {
								try {for (let hook of stringObj.intMessage.format(formatVars).match(/\([^\(\)]+\)/gi)) formatVars[hook.replace(/[\(\)]/g, "")] = n => n;}
								catch (err2) {}
							}
						}
					}
					if (returnvalue) return parseLanguageStringObj(returnvalue);
					else {
						BDFDB.LogUtils.warn([item, "failed to format string in BDFDB.LanguageUtils.LanguageStrings"]);
						return "";
					}
				}
				else return BDFDB.LanguageUtils.LanguageStrings[item];
			}
			else BDFDB.LogUtils.warn([item, "enter a valid key to format the string in BDFDB.LanguageUtils.LanguageStrings"]);
			return "";
		};
		BDFDB.LanguageUtils.LibraryStrings = new Proxy(LibraryStrings.default || {}, {
			get: function (list, item) {
				let languageId = BDFDB.LanguageUtils.getLanguage().id;
				if (LibraryStrings[languageId] && LibraryStrings[languageId][item]) return LibraryStrings[languageId][item];
				else if (LibraryStrings.default[item]) return LibraryStrings.default[item];
				else BDFDB.LogUtils.warn([item, "not found in BDFDB.LanguageUtils.LibraryStrings"]);
				return "";
			}
		});
		BDFDB.LanguageUtils.LibraryStringsCheck = new Proxy(LanguageStrings, {
			get: function (list, item) {
				return !!LibraryStrings.default[item];
			}
		});
		BDFDB.LanguageUtils.LibraryStringsFormat = function (item, ...values) {
			if (item) {
				let languageId = BDFDB.LanguageUtils.getLanguage().id, string = null;
				if (LibraryStrings[languageId] && LibraryStrings[languageId][item]) string = LibraryStrings[languageId][item];
				else if (LibraryStrings.default[item]) string = LibraryStrings.default[item];
				if (string) {
					for (let i = 0; i < values.length; i++) if (typeof values[i] == "string" || typeof values[i] == "number") string = string.replace(new RegExp(`{{var${i}}}`, "g"), values[i]);
					return string;
				}
				else BDFDB.LogUtils.warn([item, "not found in BDFDB.LanguageUtils.LibraryStrings"]);
			}
			else BDFDB.LogUtils.warn([item, "enter a valid key to format the string in BDFDB.LanguageUtils.LibraryStrings"]);
			return "";
		};
		BDFDB.TimeUtils.interval(interval => {
			if (Internal.LibraryModules.LanguageStore.chosenLocale || Internal.LibraryModules.LanguageStore._chosenLocale || BDFDB.DiscordUtils.getSettings("locale")) {
				BDFDB.TimeUtils.clear(interval);
				let language = BDFDB.LanguageUtils.getLanguage();
				if (language) BDFDB.LanguageUtils.languages.$discord = Object.assign({}, language, {name: `Discord (${language.name})`});
			}
		}, 100);
		for (let key in BDFDB.LanguageUtils.languages) try {
			if (new Date(0).toLocaleString(key, {second: 'numeric'}) != "0") {
				BDFDB.LanguageUtils.languages[key].numberMap = {};
				for (let i = 0; i < 10; i++) BDFDB.LanguageUtils.languages[key].numberMap[i] = new Date(i*1000).toLocaleString(key, {second: 'numeric'});
			}
		}
		catch (err) {}
		
		const reactInitialized = Internal.LibraryModules.React && Internal.LibraryModules.React.Component;
		Internal.setDefaultProps = function (component, defaultProps) {
			if (BDFDB.ObjectUtils.is(component)) component.defaultProps = Object.assign({}, component.defaultProps, defaultProps);
		};
		let openedItem;
		Internal.MenuItem = reactInitialized && class BDFDB_MenuItem extends Internal.LibraryModules.React.Component {
			constructor(props) {
				super(props);
				this.state = {hovered: false};
			}
			componentWillUnmount() {
				if (openedItem == this.props.id) openedItem = null;
			}
			render() {
				let color = (typeof this.props.color == "string" ? this.props.color : Internal.LibraryComponents.MenuItems.Colors.DEFAULT).toLowerCase();
				let isCustomColor = false;
				if (color) {
					if (DiscordClasses[`menu${color}`]) color = color;
					else if (BDFDB.ColorUtils.getType(color)) {
						isCustomColor = true;
						color = BDFDB.ColorUtils.convert(color, "RGBA");
					}
					else color = (Internal.LibraryComponents.MenuItems.Colors.DEFAULT || "").toLowerCase();
				}
				let renderPopout, onClose, hasPopout = BDFDB.ObjectUtils.is(this.props.popoutProps);
				if (hasPopout) {
					renderPopout = instance => {
						openedItem = this.props.id;
						return typeof this.props.popoutProps.renderPopout == "function" && this.props.popoutProps.renderPopout(instance);
					};
					onClose = instance => {
						openedItem = null;
						typeof this.props.popoutProps.onClose == "function" && this.props.popoutProps.onClose(instance);
					};
				}
				let focused = !openedItem ? this.props.isFocused : openedItem == this.props.id;
				let themeDark = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themedark;
				let item = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, Object.assign({
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.menuitem, (this.props.label || this.props.subtext) && BDFDB.disCN.menulabelcontainer, color && (isCustomColor ? BDFDB.disCN.menucolorcustom : BDFDB.disCN[`menu${color}`]), this.props.disabled && BDFDB.disCN.menudisabled, focused && BDFDB.disCN.menufocused),
					style: {
						color: isCustomColor ? ((focused || this.state.hovered) ? (BDFDB.ColorUtils.isBright(color) ? "#000000" : "#ffffff") : color) : (this.state.hovered ? "#ffffff" : null),
						background: isCustomColor && (focused || this.state.hovered) && color
					},
					onClick: this.props.disabled ? null : e => {
						if (!this.props.action) return false;
						!this.props.persisting && !hasPopout && this.props.onClose();
						this.props.action(e, this);
					},
					onMouseEnter: this.props.disabled ? null : e => {
						if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);
						this.setState({hovered: true});
					},
					onMouseLeave: this.props.disabled ? null : e => {
						if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);
						this.setState({hovered: false});
					},
					"aria-disabled": this.props.disabled,
					children: [
						typeof this.props.render == "function" ? this.props.render(this) : this.props.render,
						(this.props.label || this.props.subtext) && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.menulabel,
							children: [
								typeof this.props.label == "function" ? this.props.label(this) : this.props.label,
								this.props.subtext && BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.menusubtext,
									children: typeof this.props.subtext == "function" ? this.props.subtext(this) : this.props.subtext
								})
							].filter(n => n)
						}),
						this.props.hint && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.menuhintcontainer,
							children: typeof this.props.hint == "function" ? this.props.hint(this) : this.props.hint
						}),
						this.props.icon && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.menuiconcontainer,
							children: BDFDB.ReactUtils.createElement(this.props.icon, {
								className: BDFDB.disCN.menuicon
							})
						}),
						this.props.imageUrl && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.menuimagecontainer,
							children: BDFDB.ReactUtils.createElement("img", {
								className: BDFDB.disCN.menuimage,
								src: typeof this.props.imageUrl == "function" ? this.props.imageUrl(this) : this.props.imageUrl,
								alt: ""
							})
						})
					].filter(n => n)
				}, this.props.menuItemProps, {isFocused: focused}));
				return hasPopout ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutContainer, Object.assign({}, this.props.popoutProps, {
					children: item,
					renderPopout: renderPopout,
					onClose: onClose
				})) : item;
			}
		};
		Internal.CustomMenuItemWrapper = reactInitialized && class BDFDB_CustomMenuItemWrapper extends Internal.LibraryModules.React.Component {
			constructor(props) {
				super(props);
				this.state = {hovered: false};
			}
			render() {
				let isItem = this.props.children == Internal.MenuItem;
				let item = BDFDB.ReactUtils.createElement(this.props.children, Object.assign({}, this.props.childProps, {
					onMouseEnter: isItem ? e => {
						if (this.props.childProps && typeof this.props.childProps.onMouseEnter == "function") this.props.childProps.onMouseEnter(e, this);
						this.setState({hovered: true});
					} : this.props.childProps && this.props.childProps.onMouseEnter,
					onMouseLeave: isItem ? e => {
						if (this.props.childProps && typeof this.props.childProps.onMouseLeave == "function") this.props.childProps.onMouseLeave(e, this);
						this.setState({hovered: false});
					} : this.props.childProps && this.props.childProps.onMouseLeave,
					isFocused: this.state.hovered && !this.props.disabled
				}));
				return isItem ? item : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
					onMouseEnter: e => {
						this.setState({hovered: true});
					},
					onMouseLeave: e => {
						this.setState({hovered: false});
					},
					children: item
				});
			}
		};
		Internal.ErrorBoundary = reactInitialized && class BDFDB_ErrorBoundary extends Internal.LibraryModules.React.PureComponent {
			constructor(props) {
				super(props);
				this.state = {hasError: false};
			}
			static getDerivedStateFromError(err) {
				return {hasError: true};
			}
			componentDidCatch(err, info) {
				BDFDB.LogUtils.error(["Could not create React Element!", err]);
			}
			render() {
				if (this.state.hasError) return Internal.LibraryModules.React.createElement("span", {
					style: {
						background: BDFDB.DiscordConstants && BDFDB.DiscordConstants.Colors && BDFDB.DiscordConstants.Colors.PRIMARY_DARK,
						borderRadius: 5,
						color: BDFDB.DiscordConstants && BDFDB.DiscordConstants.Colors && BDFDB.DiscordConstants.Colors.STATUS_RED,
						fontSize: 12,
						fontWeight: 600,
						padding: 6,
						textAlign: "center",
						verticalAlign: "center"
					},
					children: "React Component Error"
				});
				return this.props.children;
			}
		};
		
		const loadComponents = _ => {
			const CustomComponents = {};
			
			CustomComponents.AutoFocusCatcher = reactInitialized && class BDFDB_AutoFocusCatcher extends Internal.LibraryModules.React.Component {
				render() {
					const style = {padding: 0, margin: 0, border: "none", width: 0, maxWidth: 0, height: 0, maxHeight: 0, visibility: "hidden"};
					return BDFDB.ReactUtils.forceStyle(BDFDB.ReactUtils.createElement("input", {style}), Object.keys(style));
				}
			};
			
			CustomComponents.BadgeAnimationContainer = reactInitialized && class BDFDB_BadgeAnimationContainer extends Internal.LibraryModules.React.Component {
				componentDidMount() {BDFDB.ReactUtils.forceUpdate(this);}
				componentWillAppear(e) {if (typeof e == "function") e();}
				componentWillEnter(e) {if (typeof e == "function") e();}
				componentWillLeave(e) {if (typeof e == "function") this.timeoutId = setTimeout(e, 300);}
				componentWillUnmount() {BDFDB.TimeUtils.clear(this.timeoutId)}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.div, {
						className: this.props.className,
						style: this.props.animatedStyle,
						children: this.props.children
					});
				}
			};
			
			CustomComponents.Badges = {};
			CustomComponents.Badges.getBadgePaddingForValue = function (count) {
				switch (count) {
					case 1:
					case 4:
					case 6:
						return 1;
					default:
						return 0;
				}
			};
			CustomComponents.Badges.IconBadge = reactInitialized && class BDFDB_IconBadge extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.badgeiconbadge, this.props.shape && Internal.LibraryComponents.Badges.BadgeShapes[this.props.shape] || Internal.LibraryComponents.Badges.BadgeShapes.ROUND),
						style: Object.assign({
							backgroundColor: this.props.disableColor ? null : (this.props.color || BDFDB.DiscordConstants.Colors.STATUS_RED)
						}, this.props.style),
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.badgeicon,
							name: this.props.icon
						})
					});
				}
			};
			CustomComponents.Badges.NumberBadge = reactInitialized && class BDFDB_NumberBadge extends Internal.LibraryModules.React.Component {
				handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
				handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
				handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
				handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
				render() {
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.badgenumberbadge, this.props.shape && Internal.LibraryComponents.Badges.BadgeShapes[this.props.shape] || Internal.LibraryComponents.Badges.BadgeShapes.ROUND),
						style: Object.assign({
							backgroundColor: !this.props.disableColor && (this.props.color || BDFDB.DiscordConstants.Colors.STATUS_RED),
							width: Internal.LibraryComponents.Badges.getBadgeWidthForValue(this.props.count),
							paddingRight: Internal.LibraryComponents.Badges.getBadgePaddingForValue(this.props.count)
						}, this.props.style),
						onClick: this.handleClick.bind(this),
						onContextMenu: this.handleContextMenu.bind(this),
						onMouseEnter: this.handleMouseEnter.bind(this),
						onMouseLeave: this.handleMouseLeave.bind(this),
						children: Internal.LibraryComponents.Badges.getBadgeCountString(this.props.count)
					});
				}
			};
			
			CustomComponents.BotTag = reactInitialized && class BDFDB_BotTag extends Internal.LibraryModules.React.Component {
				handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
				handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
				handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
				handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
				render() {
					return BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, this.props.invertColor ? BDFDB.disCN.bottaginvert : BDFDB.disCN.bottagregular, this.props.useRemSizes ? BDFDB.disCN.bottagrem : BDFDB.disCN.bottagpx),
						style: this.props.style,
						onClick: this.handleClick.bind(this),
						onContextMenu: this.handleContextMenu.bind(this),
						onMouseEnter: this.handleMouseEnter.bind(this),
						onMouseLeave: this.handleMouseLeave.bind(this),
						children: BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN.bottagtext,
							children: this.props.tag || BDFDB.LanguageUtils.LanguageStrings.BOT_TAG_BOT
						})
					});
				}
			};
			
			CustomComponents.Button = reactInitialized && class BDFDB_Button extends Internal.LibraryModules.React.Component {
				handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
				handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
				handleMouseDown(e) {if (typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);}
				handleMouseUp(e) {if (typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);}
				handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
				handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
				render() {
					let processingAndListening = (this.props.disabled || this.props.submitting) && (null != this.props.onMouseEnter || null != this.props.onMouseLeave);
					let props = BDFDB.ObjectUtils.exclude(this.props, "look", "color", "hover", "size", "fullWidth", "grow", "disabled", "submitting", "type", "style", "wrapperClassName", "className", "innerClassName", "onClick", "onContextMenu", "onMouseDown", "onMouseUp", "onMouseEnter", "onMouseLeave", "children", "rel");
					let button = BDFDB.ReactUtils.createElement("button", Object.assign({}, !this.props.disabled && !this.props.submitting && props, {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.button, this.props.look != null ? this.props.look : Internal.LibraryComponents.Button.Looks.FILLED, this.props.color != null ? this.props.color : Internal.LibraryComponents.Button.Colors.BRAND, this.props.hover, this.props.size != null ? this.props.size : Internal.LibraryComponents.Button.Sizes.MEDIUM, processingAndListening && this.props.wrapperClassName, this.props.fullWidth && BDFDB.disCN.buttonfullwidth, (this.props.grow === undefined || this.props.grow) && BDFDB.disCN.buttongrow, this.props.hover && this.props.hover !== Internal.LibraryComponents.Button.Hovers.DEFAULT && BDFDB.disCN.buttonhashover, this.props.submitting && BDFDB.disCN.buttonsubmitting),
						onClick: (this.props.disabled || this.props.submitting) ? e => {return e.preventDefault();} : this.handleClick.bind(this),
						onContextMenu: (this.props.disabled || this.props.submitting) ? e => {return e.preventDefault();} : this.handleContextMenu.bind(this),
						onMouseUp: !this.props.disabled && this.handleMouseDown.bind(this),
						onMouseDown: !this.props.disabled && this.handleMouseUp.bind(this),
						onMouseEnter: this.handleMouseEnter.bind(this),
						onMouseLeave: this.handleMouseLeave.bind(this),
						type: !this.props.type ? "button" : this.props.type,
						disabled: this.props.disabled,
						style: this.props.style,
						rel: this.props.rel,
						children: [
							this.props.submitting && !this.props.disabled ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Spinner, {
								type: Internal.LibraryComponents.Spinner.Type.PULSING_ELLIPSIS,
								className: BDFDB.disCN.buttonspinner,
								itemClassName: BDFDB.disCN.buttonspinneritem
							}) : null,
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.buttoncontents, this.props.innerClassName),
								children: this.props.children
							})
						]
					}));
					return !processingAndListening ? button : BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.buttondisabledwrapper, this.props.wrapperClassName, this.props.size != null ? this.props.size : Internal.LibraryComponents.Button.Sizes.MEDIUM, this.props.fullWidth && BDFDB.disCN.buttonfullwidth, (this.props.grow === undefined || this.props.grow) && BDFDB.disCN.buttongrow),
						children: [
							button,
							BDFDB.ReactUtils.createElement("span", {
								onMouseEnter: this.handleMouseEnter.bind(this),
								onMouseLeave: this.handleMouseLeave.bind(this),
								className: BDFDB.disCN.buttondisabledoverlay
							})
						]
					});
				}
			};
			
			CustomComponents.Card = reactInitialized && class BDFDB_Card extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement("div", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.hovercardwrapper, this.props.horizontal && BDFDB.disCN.hovercardhorizontal, this.props.backdrop && BDFDB.disCN.hovercard, this.props.className),
						onMouseEnter: e => {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);},
						onMouseLeave: e => {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);},
						onClick: e => {if (typeof this.props.onClick == "function") this.props.onClick(e, this);},
						onContextMenu: e => {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);},
						children: [
							!this.props.noRemove ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
								"aria-label": BDFDB.LanguageUtils.LanguageStrings.REMOVE,
								className: BDFDB.disCNS.hovercardremovebutton + BDFDB.disCNS.hovercardremovebuttondefault,
								onClick: e => {
									if (typeof this.props.onRemove == "function") this.props.onRemove(e, this);
									BDFDB.ListenerUtils.stopEvent(e);
								}
							}) : null,
							typeof this.props.children == "string" ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextElement, {
								className: BDFDB.disCN.hovercardinner,
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextScroller, {children: this.props.children})
							}) : this.props.children
						].flat(10).filter(n => n)
					}), "backdrop", "horizontal", "noRemove"));
				}
			};
			Internal.setDefaultProps(CustomComponents.Card, {backdrop: true, noRemove: false});
			
			CustomComponents.ChannelTextAreaButton = reactInitialized && class BDFDB_ChannelTextAreaButton extends Internal.LibraryModules.React.Component {
				render() {
					const inner = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.textareabuttonwrapper,
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
							name: this.props.iconName,
							iconSVG: this.props.iconSVG,
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareaicon, this.props.iconClassName, this.props.pulse && BDFDB.disCN.textareaiconpulse),
							nativeClass: this.props.nativeClass
						})
					});
					const button = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Button, {
						look: Internal.LibraryComponents.Button.Looks.BLANK,
						size: Internal.LibraryComponents.Button.Sizes.NONE,
						"aria-label": this.props.label,
						tabIndex: this.props.tabIndex,
						className: BDFDB.DOMUtils.formatClassName(this.props.isActive && BDFDB.disCN.textareabuttonactive),
						innerClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareabutton, this.props.className, this.props.pulse && BDFDB.disCN.textareaattachbuttonplus),
						onClick: this.props.onClick,
						onContextMenu: this.props.onContextMenu,
						onMouseEnter: this.props.onMouseEnter,
						onMouseLeave: this.props.onMouseLeave,
						children: this.props.tooltip && this.props.tooltip.text ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, Object.assign({}, this.props.tooltip, {children: inner})) : inner
					});
					return (this.props.className || "").indexOf(BDFDB.disCN.textareapickerbutton) > -1 ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.textareapickerbuttoncontainer,
						children: button
					}) : button;
				}
			};
			Internal.setDefaultProps(CustomComponents.ChannelTextAreaButton, {tabIndex: 0});
			
			CustomComponents.CharCounter = reactInitialized && class BDFDB_CharCounter extends Internal.LibraryModules.React.Component {
				getCounterString() {
					let input = this.refElement || {}, string = "";
					if (BDFDB.DOMUtils.containsClass(this.refElement, BDFDB.disCN.textarea)) {
						let instance = BDFDB.ReactUtils.findOwner(input, {name: "ChannelEditorContainer", up: true});
						if (instance) string = instance.props.textValue;
						else string = input.value || input.textContent || "";
					}
					else string = input.value || input.textContent || "";
					if (this.props.max && this.props.showPercentage && (string.length/this.props.max) * 100 < this.props.showPercentage) return "";
					let start = input.selectionStart || 0, end = input.selectionEnd || 0, selectlength = end - start, selection = BDFDB.DOMUtils.getSelection();
					let select = !selectlength && !selection ? 0 : (selectlength || selection.length);
					select = !select ? 0 : (select > string.length ? (end || start ? string.length - (string.length - end - start) : string.length) : select);
					let children = [
						typeof this.props.renderPrefix == "function" && this.props.renderPrefix(string.length),
						`${string.length}${!this.props.max ? "" : "/" + this.props.max}${!select ? "" : " (" + select + ")"}`,
						typeof this.props.renderSuffix == "function" && this.props.renderSuffix(string.length)
					].filter(n => n);
					if (typeof this.props.onChange == "function") this.props.onChange(this);
					return children.length == 1 ? children[0] : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
						align: Internal.LibraryComponents.Flex.Align.CENTER,
						children: children
					});
				}
				updateCounter() {
					if (!this.refElement) return;
					BDFDB.TimeUtils.clear(this.updateTimeout);
					this.updateTimeout = BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 100);
				}
				forceUpdateCounter() {
					if (!this.refElement) return;
					this.props.children = this.getCounterString();
					BDFDB.ReactUtils.forceUpdate(this);
				}
				handleSelection() {
					if (!this.refElement) return;
					let mouseMove = _ => {
						BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 10);
					};
					let mouseUp = _ => {
						document.removeEventListener("mousemove", mouseMove);
						document.removeEventListener("mouseup", mouseUp);
						if (this.refElement.selectionEnd - this.refElement.selectionStart) BDFDB.TimeUtils.timeout(_ => {
							document.addEventListener("click", click);
						});
					};
					let click = _ => {
						BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 100);
						document.removeEventListener("mousemove", mouseMove);
						document.removeEventListener("mouseup", mouseUp);
						document.removeEventListener("click", click);
					};
					document.addEventListener("mousemove", mouseMove);
					document.addEventListener("mouseup", mouseUp);
				}
				componentDidMount() {
					if (this.props.refClass) {
						let node = BDFDB.ReactUtils.findDOMNode(this);
						if (node && node.parentElement) {
							this.refElement = node.parentElement.querySelector(this.props.refClass);
							if (this.refElement) {
								if (!this._updateCounter) this._updateCounter = _ => {
									if (!document.contains(node)) BDFDB.ListenerUtils.multiRemove(this.refElement, "keydown click change", this._updateCounter);
									else this.updateCounter();
								};
								if (!this._handleSelection) this._handleSelection = _ => {
									if (!document.contains(node)) BDFDB.ListenerUtils.multiRemove(this.refElement, "mousedown", this._handleSelection);
									else this.handleSelection();
								};
								BDFDB.ListenerUtils.multiRemove(this.refElement, "mousedown", this._handleSelection);
								BDFDB.ListenerUtils.multiAdd(this.refElement, "mousedown", this._handleSelection);
								if (this.refElement.tagName == "INPUT" || this.refElement.tagName == "TEXTAREA") {
									BDFDB.ListenerUtils.multiRemove(this.refElement, "keydown click change", this._updateCounter);
									BDFDB.ListenerUtils.multiAdd(this.refElement, "keydown click change", this._updateCounter);
								}
								else {
									if (!this._mutationObserver) this._mutationObserver = new MutationObserver(changes => {
										if (!document.contains(node)) this._mutationObserver.disconnect();
										else this.updateCounter();
									});
									else this._mutationObserver.disconnect();
									this._mutationObserver.observe(this.refElement, {childList: true, subtree: true});
								}
								this.updateCounter();
							}
							else BDFDB.LogUtils.warn(["could not find referenceElement for BDFDB_CharCounter"]);
						}
					}
					else BDFDB.LogUtils.warn(["refClass can not be undefined for BDFDB_CharCounter"]);
				}
				render() {
					let string = this.getCounterString();
					BDFDB.TimeUtils.timeout(_ => string != this.getCounterString() && BDFDB.ReactUtils.forceUpdate(this));
					return BDFDB.ReactUtils.createElement("div", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.charcounter, this.props.className),
						children: string
					}), "parsing", "max", "refClass", "renderPrefix", "renderSuffix", "showPercentage"));
				}
			};
			
			CustomComponents.Checkbox = reactInitialized && class BDFDB_Checkbox extends Internal.LibraryModules.React.Component {
				handleMouseDown(e) {if (typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);}
				handleMouseUp(e) {if (typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);}
				handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
				handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
				getInputMode() {
					return this.props.disabled ? "disabled" : this.props.readOnly ? "readonly" : "default";
				}
				getStyle() {
					let style = this.props.style || {};
					if (!this.props.value) return style;
					style = Object.assign({}, style);
					this.props.color = typeof this.props.getColor == "function" ? this.props.getColor(this.props.value) : this.props.color;
					if (Internal.LibraryComponents.Checkbox.Types) switch (this.props.type) {
						case Internal.LibraryComponents.Checkbox.Types.DEFAULT:
							style.borderColor = this.props.color;
							break;
						case Internal.LibraryComponents.Checkbox.Types.GHOST:
							let color = BDFDB.ColorUtils.setAlpha(this.props.color, 0.15, "RGB");
							style.backgroundColor = color;
							style.borderColor = color;
							break;
						case Internal.LibraryComponents.Checkbox.Types.INVERTED:
							style.backgroundColor = this.props.color;
							style.borderColor = this.props.color;
					}
					return style;
				}
				getColor() {
					return this.props.value ? (Internal.LibraryComponents.Checkbox.Types && this.props.type === Internal.LibraryComponents.Checkbox.Types.INVERTED ? BDFDB.DiscordConstants.Colors.WHITE : this.props.color) : "transparent";
				}
				handleChange(e) {
					this.props.value = typeof this.props.getValue == "function" ? this.props.getValue(this.props.value, e, this) : !this.props.value;
					if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					let label = this.props.children ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.checkboxlabel, this.props.disabled ? BDFDB.disCN.checkboxlabeldisabled : BDFDB.disCN.checkboxlabelclickable, this.props.reverse ? BDFDB.disCN.checkboxlabelreversed : BDFDB.disCN.checkboxlabelforward),
						style: {
							lineHeight: this.props.size + "px"
						},
						children: this.props.children
					}) : null;
					return BDFDB.ReactUtils.createElement("label", {
						className: BDFDB.DOMUtils.formatClassName(this.props.disabled ? BDFDB.disCN.checkboxwrapperdisabled : BDFDB.disCN.checkboxwrapper, this.props.align, this.props.className),
						children: [
							this.props.reverse && label,
							!this.props.displayOnly && BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FocusRingScope, {
								children: BDFDB.ReactUtils.createElement("input", {
									className: BDFDB.disCN["checkboxinput" + this.getInputMode()],
									type: "checkbox",
									onClick: this.props.disabled || this.props.readOnly ? (_ => {}) : this.handleChange.bind(this),
									onContextMenu: this.props.disabled || this.props.readOnly ? (_ => {}) : this.handleChange.bind(this),
									onMouseUp: !this.props.disabled && this.handleMouseDown.bind(this),
									onMouseDown: !this.props.disabled && this.handleMouseUp.bind(this),
									onMouseEnter: !this.props.disabled && this.handleMouseEnter.bind(this),
									onMouseLeave: !this.props.disabled && this.handleMouseLeave.bind(this),
									checked: this.props.value,
									style: {
										width: this.props.size,
										height: this.props.size
									}
								})
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.checkbox, BDFDB.disCN["checkbox" + this.props.shape], this.props.value && BDFDB.disCN.checkboxchecked),
								style: Object.assign({
									width: this.props.size,
									height: this.props.size,
									borderColor: this.props.checkboxColor
								}, this.getStyle()),
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Checkmark, {
									width: 18,
									height: 18,
									color: this.getColor(),
									"aria-hidden": true
								})
							}),
							!this.props.reverse && label
						].filter(n => n)
					});
				}
			};
			CustomComponents.Checkbox.Types = {
				DEFAULT: "DEFAULT",
				GHOST: "GHOST",
				INVERTED: "INVERTED"
			};
			CustomComponents.Checkbox.Shapes = {
				BOX: "box",
				ROUND: "round"
			};
			Internal.setDefaultProps(CustomComponents.Checkbox, {type: CustomComponents.Checkbox.Types.INVERTED, shape: CustomComponents.Checkbox.Shapes.ROUND});
			
			CustomComponents.Clickable = reactInitialized && class BDFDB_Clickable extends Internal.LibraryModules.React.Component {
				handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
				handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
				handleMouseDown(e) {if (typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);}
				handleMouseUp(e) {if (typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);}
				handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
				handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.Clickable, Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, (this.props.className || "").toLowerCase().indexOf("disabled") == -1 && BDFDB.disCN.cursorpointer),
						onClick: this.handleClick.bind(this),
						onContextMenu: this.handleContextMenu.bind(this),
						onMouseUp: this.handleMouseDown.bind(this),
						onMouseDown: !this.props.disabled && this.handleMouseUp.bind(this),
						onMouseEnter: this.handleMouseEnter.bind(this),
						onMouseLeave: this.handleMouseLeave.bind(this)
					}));
				}
			};
			
			CustomComponents.CollapseContainer = reactInitialized && class BDFDB_CollapseContainer extends Internal.LibraryModules.React.Component {
				render() {
					if (!BDFDB.ObjectUtils.is(this.props.collapseStates)) this.props.collapseStates = {};
					this.props.collapsed = this.props.collapsed && (this.props.collapseStates[this.props.title] || this.props.collapseStates[this.props.title] === undefined);
					this.props.collapseStates[this.props.title] = this.props.collapsed;
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.collapsed && BDFDB.disCN.collapsecontainercollapsed, this.props.mini ? BDFDB.disCN.collapsecontainermini : BDFDB.disCN.collapsecontainer, this.props.className),
						id: this.props.id,
						children: [
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
								className: BDFDB.disCN.collapsecontainerheader,
								align: Internal.LibraryComponents.Flex.Align.CENTER,
								onClick: e => {
									this.props.collapsed = !this.props.collapsed;
									this.props.collapseStates[this.props.title] = this.props.collapsed;
									if (typeof this.props.onClick == "function") this.props.onClick(this.props.collapsed, this);
									BDFDB.ReactUtils.forceUpdate(this);
								},
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormTitle, {
									tag: Internal.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									className: BDFDB.disCN.collapsecontainertitle,
									children: this.props.title
								})
							}),
							!this.props.collapsed ? BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.collapsecontainerinner,
								children: this.props.children
							}) : null
						]
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.CollapseContainer, {collapsed: true, mini: true});
			
			CustomComponents.ColorPicker = reactInitialized && class BDFDB_ColorPicker extends Internal.LibraryModules.React.Component {
				constructor(props) {
					super(props);
					if (!this.state) this.state = {};
					this.state.isGradient = props.gradient && props.color && BDFDB.ObjectUtils.is(props.color);
					this.state.gradientBarEnabled = this.state.isGradient;
					this.state.draggingAlphaCursor = false;
					this.state.draggingGradientCursor = false;
					this.state.selectedGradientCursor = 0;
				}
				handleColorChange(color) {
					let changed = false;
					if (color != null) {
						changed = !BDFDB.equals(this.state.isGradient ? this.props.color[this.state.selectedGradientCursor] : this.props.color, color);
						if (this.state.isGradient) this.props.color[this.state.selectedGradientCursor] = color;
						else this.props.color = color;
					}
					else changed = true;
					if (changed) {
						if (typeof this.props.onColorChange == "function") this.props.onColorChange(BDFDB.ColorUtils.convert(this.props.color, "RGBCOMP"));
						BDFDB.ReactUtils.forceUpdate(this);
					}
				}
				render() {
					if (this.state.isGradient) this.props.color = Object.assign({}, this.props.color);
					
					let hslFormat = this.props.alpha ? "HSLA" : "HSL";
					let hexRegex = this.props.alpha ? /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i : /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
					
					let selectedColor = BDFDB.ColorUtils.convert(this.state.isGradient ? this.props.color[this.state.selectedGradientCursor] : this.props.color, hslFormat) || BDFDB.ColorUtils.convert("#000000FF", hslFormat);
					let currentGradient = (this.state.isGradient ? Object.entries(this.props.color, hslFormat) : [[0, selectedColor], [1, selectedColor]]);
					
					let [h, s, l] = BDFDB.ColorUtils.convert(selectedColor, "HSLCOMP");
					let a = BDFDB.ColorUtils.getAlpha(selectedColor);
					a = a == null ? 1 : a;
					
					let hexColor = BDFDB.ColorUtils.convert(selectedColor, this.props.alpha ? "HEXA" : "HEX");
					let hexLength = hexColor.length;
					
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutFocusLock, {
						className: BDFDB.disCNS.colorpickerwrapper + BDFDB.disCN.colorpicker,
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.colorpickerinner,
								children: [
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.colorpickersaturation,
										children: BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.colorpickersaturationcolor,
											style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0, cursor: "crosshair", backgroundColor: BDFDB.ColorUtils.convert([h, "100%", "100%"], "RGB")},
											onClick: event => {
												let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickersaturationcolor, event.target));
												this.handleColorChange(BDFDB.ColorUtils.convert([h, BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, 100], event.clientX) + "%", BDFDB.NumberUtils.mapRange([rects.top, rects.top + rects.height], [100, 0], event.clientY) + "%", a], hslFormat));
											},
											onMouseDown: event => {
												let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickersaturationcolor, event.target));
												let mouseUp = _ => {
													document.removeEventListener("mouseup", mouseUp);
													document.removeEventListener("mousemove", mouseMove);
												};
												let mouseMove = event2 => {
													this.handleColorChange(BDFDB.ColorUtils.convert([h, BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, 100], event2.clientX) + "%", BDFDB.NumberUtils.mapRange([rects.top, rects.top + rects.height], [100, 0], event2.clientY) + "%", a], hslFormat));
												};
												document.addEventListener("mouseup", mouseUp);
												document.addEventListener("mousemove", mouseMove);
											},
											children: [
												BDFDB.ReactUtils.createElement("style", {
													children: `${BDFDB.dotCN.colorpickersaturationwhite} {background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));background: linear-gradient(to right, #fff, rgba(255,255,255,0));}${BDFDB.dotCN.colorpickersaturationblack} {background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));background: linear-gradient(to top, #000, rgba(0,0,0,0));}`
												}),
												BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.colorpickersaturationwhite,
													style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
													children: [
														BDFDB.ReactUtils.createElement("div", {
															className: BDFDB.disCN.colorpickersaturationblack,
															style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0}
														}),
														BDFDB.ReactUtils.createElement("div", {
															className: BDFDB.disCN.colorpickersaturationcursor,
															style: {position: "absolute", cursor: "crosshair", left: s, top: `${BDFDB.NumberUtils.mapRange([0, 100], [100, 0], parseFloat(l))}%`},
															children: BDFDB.ReactUtils.createElement("div", {
																style: {width: 4, height: 4, boxShadow: "rgb(255, 255, 255) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.3) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.4) 0px 0px 1px 2px", borderRadius: "50%", transform: "translate(-2px, -2px)"}
															})
														})
													]
												})
											]
										})
									}),
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.colorpickerhue,
										children: BDFDB.ReactUtils.createElement("div", {
											style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
											children: BDFDB.ReactUtils.createElement("div", {
												className: BDFDB.disCN.colorpickerhuehorizontal,
												style: {padding: "0px 2px", position: "relative", height: "100%"},
												onClick: event => {
													let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickerhuehorizontal, event.target));
													this.handleColorChange(BDFDB.ColorUtils.convert([BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, 360], event.clientX), s, l, a], hslFormat));
												},
												onMouseDown: event => {
													let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickerhuehorizontal, event.target));
													let mouseUp = _ => {
														document.removeEventListener("mouseup", mouseUp);
														document.removeEventListener("mousemove", mouseMove);
													};
													let mouseMove = event2 => {
														this.handleColorChange(BDFDB.ColorUtils.convert([BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, 360], event2.clientX), s, l, a], hslFormat));
													};
													document.addEventListener("mouseup", mouseUp);
													document.addEventListener("mousemove", mouseMove);
												},
												children: [
													BDFDB.ReactUtils.createElement("style", {
														children: `${BDFDB.dotCN.colorpickerhuehorizontal} {background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);background: -webkit-linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);}${BDFDB.dotCN.colorpickerhuevertical} {background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);}`
													}),
													BDFDB.ReactUtils.createElement("div", {
														className: BDFDB.disCN.colorpickerhuecursor,
														style: {position: "absolute", cursor: "ew-resize", left: `${BDFDB.NumberUtils.mapRange([0, 360], [0, 100], h)}%`},
														children: BDFDB.ReactUtils.createElement("div", {
															style: {marginTop: 1, width: 4, borderRadius: 1, height: 8, boxShadow: "rgba(0, 0, 0, 0.6) 0px 0px 2px", background: "rgb(255, 255, 255)", transform: "translateX(-2px)"}
														})
													})
												]
											})
										})
									}),
									this.props.alpha && BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.colorpickeralpha,
										children: [
											BDFDB.ReactUtils.createElement("div", {
												style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
												children: BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.colorpickeralphacheckered,
													style: {padding: "0px 2px", position: "relative", height: "100%"}
												})
											}),
											BDFDB.ReactUtils.createElement("div", {
												style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
												children: BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.colorpickeralphahorizontal,
													style: {padding: "0px 2px", position: "relative", height: "100%", background: `linear-gradient(to right, ${BDFDB.ColorUtils.setAlpha([h, s, l], 0, "RGBA")}, ${BDFDB.ColorUtils.setAlpha([h, s, l], 1, "RGBA")}`},
													onClick: event => {
														let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickeralphahorizontal, event.target));
														this.handleColorChange(BDFDB.ColorUtils.setAlpha([h, s, l], BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, 1], event.clientX), hslFormat));
													},
													onMouseDown: event => {
														let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickeralphahorizontal, event.target));
														let mouseUp = _ => {
															document.removeEventListener("mouseup", mouseUp);
															document.removeEventListener("mousemove", mouseMove);
															this.state.draggingAlphaCursor = false;
															BDFDB.ReactUtils.forceUpdate(this);
														};
														let mouseMove = event2 => {
															this.state.draggingAlphaCursor = true;
															this.handleColorChange(BDFDB.ColorUtils.setAlpha([h, s, l], BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, 1], event2.clientX), hslFormat));
														};
														document.addEventListener("mouseup", mouseUp);
														document.addEventListener("mousemove", mouseMove);
													},
													children: BDFDB.ReactUtils.createElement("div", {
														className: BDFDB.disCN.colorpickeralphacursor,
														style: {position: "absolute", cursor: "ew-resize", left: `${a * 100}%`},
														children: [
															BDFDB.ReactUtils.createElement("div", {
																style: {marginTop: 1, width: 4, borderRadius: 1, height: 8, boxShadow: "rgba(0, 0, 0, 0.6) 0px 0px 2px", background: "rgb(255, 255, 255)", transform: "translateX(-2px)"}
															}),
															this.state.draggingAlphaCursor && BDFDB.ReactUtils.createElement("span", {
																className: BDFDB.disCN.sliderbubble,
																style: {opacity: 1, visibility: "visible", left: 2},
																children: `${Math.floor(a * 100)}%`
															})
														].filter(n => n)
													})
												})
											})
										]
									}),
									this.state.gradientBarEnabled && BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.colorpickergradient,
										children: [
											BDFDB.ReactUtils.createElement("div", {
												style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
												children: BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.colorpickergradientcheckered,
													style: {padding: "0px 2px", position: "relative", height: "100%"}
												})
											}),
											BDFDB.ReactUtils.createElement("div", {
												style: {position: "absolute", top: 0, right: 0, bottom: 0, left: 0},
												children: BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.colorpickergradienthorizontal,
													style: {padding: "0px 2px", position: "relative", cursor: "copy", height: "100%", background: BDFDB.ColorUtils.createGradient(currentGradient.reduce((colorObj, posAndColor) => (colorObj[posAndColor[0]] = posAndColor[1], colorObj), {}))},
													onClick: event => {
														let rects = BDFDB.DOMUtils.getRects(event.target);
														let pos = BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0.01, 0.99], event.clientX);
														if (Object.keys(this.props.color).indexOf(pos) == -1) {
															this.props.color[pos] = BDFDB.ColorUtils.convert("#000000FF", hslFormat);
															this.state.selectedGradientCursor = pos;
															this.handleColorChange();
														}
													},
													children: currentGradient.map(posAndColor => BDFDB.ReactUtils.createElement("div", {
														className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickergradientcursor, (posAndColor[0] == 0 || posAndColor[0] == 1) && BDFDB.disCN.colorpickergradientcursoredge, this.state.selectedGradientCursor == posAndColor[0] && BDFDB.disCN.colorpickergradientcursorselected),
														style: {position: "absolute", cursor: "pointer", left: `${posAndColor[0] * 100}%`},
														onMouseDown: posAndColor[0] == 0 || posAndColor[0] == 1 ? _ => {} : event => {
															event = event.nativeEvent || event;
															let mouseMove = event2 => {
																if (Math.sqrt((event.pageX - event2.pageX)**2) > 10) {
																	document.removeEventListener("mousemove", mouseMove);
																	document.removeEventListener("mouseup", mouseUp);
																	
																	this.state.draggingGradientCursor = true;
																	let cursor = BDFDB.DOMUtils.getParent(BDFDB.dotCN.colorpickergradientcursor, event.target);
																	let rects = BDFDB.DOMUtils.getRects(cursor.parentElement);
																	
																	let releasing = _ => {
																		document.removeEventListener("mousemove", dragging);
																		document.removeEventListener("mouseup", releasing);
																		BDFDB.TimeUtils.timeout(_ => {this.state.draggingGradientCursor = false;});
																	};
																	let dragging = event3 => {
																		let pos = BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0.01, 0.99], event3.clientX);
																		if (Object.keys(this.props.color).indexOf(pos) == -1) {
																			delete this.props.color[posAndColor[0]];
																			posAndColor[0] = pos;
																			this.props.color[pos] = posAndColor[1];
																			this.state.selectedGradientCursor = pos;
																			this.handleColorChange();
																		}
																	};
																	document.addEventListener("mousemove", dragging);
																	document.addEventListener("mouseup", releasing);
																}
															};
															let mouseUp = _ => {
																document.removeEventListener("mousemove", mouseMove);
																document.removeEventListener("mouseup", mouseUp);
															};
															document.addEventListener("mousemove", mouseMove);
															document.addEventListener("mouseup", mouseUp);
														},
														onClick: event => {
															BDFDB.ListenerUtils.stopEvent(event);
															if (!this.state.draggingGradientCursor) {
																this.state.selectedGradientCursor = posAndColor[0];
																BDFDB.ReactUtils.forceUpdate(this);
															}
														},
														onContextMenu: posAndColor[0] == 0 || posAndColor[0] == 1 ? _ => {} : event => {
															BDFDB.ListenerUtils.stopEvent(event);
															delete this.props.color[posAndColor[0]];
															this.state.selectedGradientCursor = 0;
															this.handleColorChange();
														},
														children: BDFDB.ReactUtils.createElement("div", {
															style: {background: BDFDB.ColorUtils.convert(posAndColor[1], "RGBA")}
														})
													}))
												})
											})
										]
									})
								].filter(n => n)
							}),
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextInput, {
								className: BDFDB.disCNS.colorpickerhexinput + BDFDB.disCN.margintop8,
								maxLength: this.props.alpha ? 9 : 7,
								valuePrefix: "#",
								value: hexColor,
								autoFocus: true,
								onChange: value => {
									const oldLength = hexLength;
									hexLength = (value || "").length;
									if (this.props.alpha && (oldLength > 8 || oldLength < 6) && hexLength == 7) value += "FF";
									if (hexRegex.test(value)) this.handleColorChange(value);
								},
								inputChildren: this.props.gradient && BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
									text: BDFDB.LanguageUtils.LibraryStrings.gradient,
									children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickergradientbutton, this.state.gradientBarEnabled && BDFDB.disCN.colorpickergradientbuttonenabled),
										children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
											nativeClass: true,
											width: 28,
											height: 28,
											name: Internal.LibraryComponents.SvgIcon.Names.GRADIENT
										}),
										onClick: _ => {
											this.state.gradientBarEnabled = !this.state.gradientBarEnabled;
											if (this.state.gradientBarEnabled && !this.state.isGradient) this.props.color = {0: selectedColor, 1: selectedColor};
											else if (!this.state.gradientBarEnabled && this.state.isGradient) this.props.color = selectedColor;
											this.state.isGradient = this.props.color && BDFDB.ObjectUtils.is(this.props.color);
											this.handleColorChange();
										}
									})
								})
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: "move-corners",
								children: [{top: 0, left: 0}, {top: 0, right: 0}, {bottom: 0, right: 0}, {bottom: 0, left: 0}].map(pos => BDFDB.ReactUtils.createElement("div", {
									className: "move-corner",
									onMouseDown: e => {
										if (!this.domElementRef.current) return;
										let rects = BDFDB.DOMUtils.getRects(this.domElementRef.current);
										let left = rects.left, top = rects.top;
										let oldX = e.pageX, oldY = e.pageY;
										let mouseUp = _ => {
											document.removeEventListener("mouseup", mouseUp);
											document.removeEventListener("mousemove", mouseMove);
										};
										let mouseMove = e2 => {
											left = left - (oldX - e2.pageX), top = top - (oldY - e2.pageY);
											oldX = e2.pageX, oldY = e2.pageY;
											this.domElementRef.current.style.setProperty("left", `${left}px`, "important");
											this.domElementRef.current.style.setProperty("top", `${top}px`, "important");
										};
										document.addEventListener("mouseup", mouseUp);
										document.addEventListener("mousemove", mouseMove);
									},
									style: Object.assign({}, pos, {width: 10, height: 10, cursor: "move", position: "absolute"})
								}))
							})
						]
					});
				}
			};
			
			CustomComponents.ColorSwatches = reactInitialized && class BDFDB_ColorSwatches extends Internal.LibraryModules.React.Component {
				ColorSwatch(props) {
					const swatches = props.swatches;
					let useWhite = !BDFDB.ColorUtils.isBright(props.color);
					let swatch = BDFDB.ReactUtils.createElement("button", {
						type: "button",
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickerswatch, props.isSingle && BDFDB.disCN.colorpickerswatchsingle, props.isDisabled && BDFDB.disCN.colorpickerswatchdisabled, props.isSelected && BDFDB.disCN.colorpickerswatchselected, props.isCustom && BDFDB.disCN.colorpickerswatchcustom, props.color == null && BDFDB.disCN.colorpickerswatchnocolor),
						number: props.number,
						disabled: props.isDisabled,
						onClick: _ => {
							if (!props.isSelected) {
								let color = props.isCustom && props.color == null ? (swatches.props.color || swatches.props.defaultCustomColor || "rgba(0, 0, 0, 1)") : props.color;
								if (typeof swatches.props.onColorChange == "function") swatches.props.onColorChange(BDFDB.ColorUtils.convert(color, "RGBCOMP"));
								swatches.props.color = color;
								swatches.props.customColor = props.isCustom ? color : swatches.props.customColor;
								swatches.props.customSelected = props.isCustom;
								BDFDB.ReactUtils.forceUpdate(swatches);
							}
						},
						style: Object.assign({}, props.style, {
							background: BDFDB.ObjectUtils.is(props.color) ? BDFDB.ColorUtils.createGradient(props.color) : BDFDB.ColorUtils.convert(props.color, "RGBA")
						}),
						children: [
							props.isCustom || props.isSingle ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.colorpickerswatchdropper,
								foreground: BDFDB.disCN.colorpickerswatchdropperfg,
								name: Internal.LibraryComponents.SvgIcon.Names.DROPPER,
								width: props.isCustom ? 14 : 10,
								height: props.isCustom ? 14 : 10,
								color: useWhite ? BDFDB.DiscordConstants.Colors.WHITE : BDFDB.DiscordConstants.Colors.BLACK
							}) : null,
							props.isSelected && !props.isSingle ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
								name: Internal.LibraryComponents.SvgIcon.Names.CHECKMARK,
								width: props.isCustom ? 32 : 16,
								height: props.isCustom ? 24 : 16,
								color: useWhite ? BDFDB.DiscordConstants.Colors.WHITE : BDFDB.DiscordConstants.Colors.BLACK
							}) : null
						]
					});
					if (props.isCustom || props.isSingle || props.color == null) swatch = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
						text: props.isCustom || props.isSingle ? BDFDB.LanguageUtils.LanguageStrings.CUSTOM_COLOR : BDFDB.LanguageUtils.LanguageStrings.DEFAULT,
						tooltipConfig: {type: props.isSingle ? "top" : "bottom"},
						children: swatch
					});
					if (props.isCustom || props.isSingle) swatch = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutContainer, {
						children: swatch,
						wrap: false,
						popoutClassName: BDFDB.disCNS.colorpickerwrapper + BDFDB.disCN.colorpicker,
						animation: Internal.LibraryComponents.PopoutContainer.Animation.TRANSLATE,
						position: Internal.LibraryComponents.PopoutContainer.Positions.BOTTOM,
						align: Internal.LibraryComponents.PopoutContainer.Align.CENTER,
						open: swatches.props.pickerOpen,
						onClick: _ => swatches.props.pickerOpen = true,
						onOpen: _ => {
							swatches.props.pickerOpen = true;
							if (typeof swatches.props.onPickerOpen == "function") swatches.props.onPickerOpen(this);
						},
						onClose: _ => {
							delete swatches.props.pickerOpen;
							if (typeof swatches.props.onPickerClose == "function") swatches.props.onPickerClose(this);
						},
						renderPopout: _ => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ColorPicker, Object.assign({}, swatches.props.pickerConfig, {
							color: swatches.props.color,
							onColorChange: color => {
								if (typeof swatches.props.onColorChange == "function") swatches.props.onColorChange(color);
								props.color = color;
								swatches.props.color = color;
								swatches.props.customColor = color;
								swatches.props.customSelected = true;
								BDFDB.ReactUtils.forceUpdate(swatches);
							}
						}), true)
					});
					if (props.isCustom) swatch = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.colorpickerswatchcustomcontainer,
						children: swatch
					});
					return swatch;
				}
				render() {
					this.props.color = BDFDB.ObjectUtils.is(this.props.color) ? this.props.color : BDFDB.ColorUtils.convert(this.props.color, "RGBA");
					this.props.colors = (BDFDB.ArrayUtils.is(this.props.colors) ? this.props.colors : [null, 5433630, 3066993, 1752220, 3447003, 3429595, 8789737, 10181046, 15277667, 15286558, 15158332, 15105570, 15844367, 13094093, 7372936, 6513507, 16777215, 3910932, 2067276, 1146986, 2123412, 2111892, 7148717, 7419530, 11342935, 11345940, 10038562, 11027200, 12745742, 9936031, 6121581, 2894892]).map(c => BDFDB.ColorUtils.convert(c, "RGBA"));
					this.props.colorRows = this.props.colors.length ? [this.props.colors.slice(0, parseInt(this.props.colors.length/2)), this.props.colors.slice(parseInt(this.props.colors.length/2))] : [];
					this.props.customColor = !this.props.color || !this.props.customSelected && this.props.colors.indexOf(this.props.color) > -1 ? null : this.props.color;
					this.props.defaultCustomColor = BDFDB.ObjectUtils.is(this.props.defaultCustomColor) ? this.props.defaultCustomColor : BDFDB.ColorUtils.convert(this.props.defaultCustomColor, "RGBA");
					this.props.customSelected = !!this.props.customColor;
					this.props.pickerConfig = BDFDB.ObjectUtils.is(this.props.pickerConfig) ? this.props.pickerConfig : {gradient: true, alpha: true};
					
					const isSingle = !this.props.colors.length;
					return BDFDB.ReactUtils.createElement("div", {
						className: isSingle ? BDFDB.disCN.colorpickerswatchsinglewrapper : BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickerswatches, BDFDB.disCN.colorpickerswatchescontainer, this.props.disabled && BDFDB.disCN.colorpickerswatchesdisabled),
						children: [
							BDFDB.ReactUtils.createElement(this.ColorSwatch, {
								swatches: this,
								color: this.props.customColor,
								isSingle: isSingle,
								isCustom: !isSingle,
								isSelected: this.props.customSelected,
								isDisabled: this.props.disabled,
								pickerOpen: this.props.pickerOpen,
								style: {margin: 0}
							}),
							!isSingle && BDFDB.ReactUtils.createElement("div", {
								children: this.props.colorRows.map(row => BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.colorpickerrow,
									children: row.map(color => BDFDB.ReactUtils.createElement(this.ColorSwatch, {
										swatches: this,
										color: color,
										isCustom: false,
										isSelected: !this.props.customSelected && color == this.props.color,
										isDisabled: this.props.disabled
									}))
								}))
							}) 
						]
					});
				}
			};

			CustomComponents.DateInput = class BDFDB_DateInput extends Internal.LibraryModules.React.Component {
				renderFormatButton(props) {
					const button = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
						className: BDFDB.disCN.dateinputbutton,
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
							name: props.svgName,
							width: 20,
							height: 20
						})
					});
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutContainer, {
						width: props.popoutWidth || 350,
						padding: 10,
						animation: Internal.LibraryComponents.PopoutContainer.Animation.SCALE,
						position: Internal.LibraryComponents.PopoutContainer.Positions.TOP,
						align: Internal.LibraryComponents.PopoutContainer.Align.RIGHT,
						onClose: instance => BDFDB.DOMUtils.removeClass(instance.domElementRef.current, BDFDB.disCN.dateinputbuttonselected),
						renderPopout: instance => {
							BDFDB.DOMUtils.addClass(instance.domElementRef.current, BDFDB.disCN.dateinputbuttonselected);
							return props.children || BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
								align: Internal.LibraryComponents.Flex.Align.CENTER,
								children: [
									props.name && BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsLabel, {
										label: props.name
									}),
									BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextInput, {
										className: BDFDB.disCN.dateinputfield,
										placeholder: props.placeholder,
										value: props.getValue(),
										onChange: typeof props.onChange == "function" ? props.onChange : null
									}),
									props.tooltipText && this.renderInfoButton(props.tooltipText)
								].filter(n => n)
							})
						},
						children: props.name ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
							text: props.name,
							children: button
						}) : button
					});
				}
				renderInfoButton(text, style) {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
						text: [text].flat(10).filter(n => n).map(n => BDFDB.ReactUtils.createElement("div", {children: n})),
						tooltipConfig: {
							type: "bottom",
							zIndex: 1009,
							maxWidth: 560
						},
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.dateinputbutton,
							style: Object.assign({}, style),
							children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
								name: Internal.LibraryComponents.SvgIcon.Names.QUESTIONMARK,
								width: 24,
								height: 24
							})
						})
					});
				}
				handleChange() {
					if (typeof this.props.onChange == "function") this.props.onChange(BDFDB.ObjectUtils.extract(this.props, "formatString", "dateString", "timeString", "timeOffset", "language"));
				}
				render() {
					let input = this, formatter, preview;
					const defaultOffset = ((new Date()).getTimezoneOffset() * (-1/60));
					return BDFDB.ReactUtils.createElement("div", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.dateinputwrapper, this.props.className),
						children: [
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsLabel, {
								label: this.props.label
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.dateinputinner,
								children: [
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.dateinputcontrols,
										children: [
											BDFDB.ReactUtils.createElement(class DateInputPreview extends Internal.LibraryModules.React.Component {
												componentDidMount() {formatter = this;}
												render() {
													return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextInput, {
														className: BDFDB.disCN.dateinputfield,
														placeholder: Internal.LibraryComponents.DateInput.getDefaultString(input.props.language),
														value: input.props.formatString,
														onChange: value => {
															input.props.formatString = value;
															input.handleChange.apply(input, []);
															BDFDB.ReactUtils.forceUpdate(formatter, preview);
														}
													});
												}
											}),
											this.renderInfoButton([
												"$date will be replaced with the Date",
												"$time will be replaced with the Time",
												"$time12 will be replaced with the Time (12h Form)",
												"$month will be replaced with the Month Name",
												"$monthS will be replaced with the Month Name (Short Form)",
												"$day will be replaced with the Weekday Name",
												"$dayS will be replaced with the Weekday Name (Short Form)",
												"$agoAmount will be replaced with ('Today', 'Yesterday', 'x days/weeks/months ago')",
												"$agoDays will be replaced with ('Today', 'Yesterday', 'x days ago')",
												"$agoDate will be replaced with ('Today', 'Yesterday', $date)"
											], {marginRight: 6}),
											this.renderFormatButton({
												name: BDFDB.LanguageUtils.LanguageStrings.DATE,
												svgName: Internal.LibraryComponents.SvgIcon.Names.CALENDAR,
												placeholder: this.props.dateString,
												getValue: _ => this.props.dateString,
												tooltipText: [
													"$d will be replaced with the Day",
													"$dd will be replaced with the Day (Forced Zeros)",
													"$m will be replaced with the Month",
													"$mm will be replaced with the Month (Forced Zeros)",
													"$yy will be replaced with the Year (2-Digit)",
													"$yyyy will be replaced with the Year (4-Digit)",
													"$month will be replaced with the Month Name",
													"$monthS will be replaced with the Month Name (Short Form)",
												],
												onChange: value => {
													this.props.dateString = value;
													this.handleChange.apply(this, []);
													BDFDB.ReactUtils.forceUpdate(formatter, preview);
												}
											}),
											this.renderFormatButton({
												name: BDFDB.LanguageUtils.LibraryStrings.time,
												svgName: Internal.LibraryComponents.SvgIcon.Names.CLOCK,
												placeholder: this.props.timeString,
												getValue: _ => this.props.timeString,
												tooltipText: [
													"$h will be replaced with the Hours",
													"$hh will be replaced with the Hours (Forced Zeros)",
													"$m will be replaced with the Minutes",
													"$mm will be replaced with the Minutes (Forced Zeros)",
													"$s will be replaced with the Seconds",
													"$ss will be replaced with the Seconds (Forced Zeros)",
													"$u will be replaced with the Milliseconds",
													"$uu will be replaced with the Milliseconds (Forced Zeros)"
												],
												onChange: value => {
													this.props.timeString = value;
													this.handleChange.apply(this, []);
													BDFDB.ReactUtils.forceUpdate(formatter, preview);
												}
											}),
											this.renderFormatButton({
												name: BDFDB.LanguageUtils.LibraryStrings.location,
												svgName: Internal.LibraryComponents.SvgIcon.Names.GLOBE,
												popoutWidth: 550,
												children: [
													BDFDB.ReactUtils.createElement(Internal.LibraryComponents.AutoFocusCatcher, {}),
													BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
														className: BDFDB.disCN.marginbottom4,
														align: Internal.LibraryComponents.Flex.Align.CENTER,
														children: [
															BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsLabel, {
																label: BDFDB.LanguageUtils.LanguageStrings.LANGUAGE
															}),
															BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Select, {
																className: BDFDB.disCN.dateinputfield,
																value: this.props.language != null ? this.props.language : "$discord",
																options: Object.keys(BDFDB.LanguageUtils.languages).map(id => ({
																	value: id,
																	label: BDFDB.LanguageUtils.getName(BDFDB.LanguageUtils.languages[id])
																})),
																searchable: true,
																optionRenderer: lang => lang.label,
																onChange: value => {
																	this.props.language = value == "$discord" ? undefined : value;
																	this.handleChange.apply(this, []);
																	BDFDB.ReactUtils.forceUpdate(formatter, preview);
																}
															})
														]
													}),
													BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
														align: Internal.LibraryComponents.Flex.Align.CENTER,
														children: [
															BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsLabel, {
																label: BDFDB.LanguageUtils.LibraryStrings.timezone
															}),
															BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Select, {
																className: BDFDB.disCN.dateinputfield,
																value: this.props.timeOffset != null ? this.props.timeOffset : defaultOffset,
																options: [-12.0, -11.0, -10.0, -9.5, -9.0, -8.0, -7.0, -6.0, -5.0, -4.0, -3.5, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 5.75, 6.0, 6.5, 7.0, 8.0, 8.75, 9.0, 9.5, 10.0, 10.5, 11.0, 12.0, 12.75, 13.0, 14.0].map(offset => ({label: offset< 0 ? offset : `+${offset}`, value: offset})),
																searchable: true,
																onChange: value => {
																	this.props.timeOffset = value == defaultOffset ? undefined : value;
																	this.handleChange.apply(this, []);
																	BDFDB.ReactUtils.forceUpdate(formatter, preview);
																}
															})
														]
													})
												]
											})
										]
									}),
									BDFDB.ReactUtils.createElement(class DateInputPreview extends Internal.LibraryModules.React.Component {
										componentDidMount() {preview = this;}
										render() {
											return !input.props.noPreview && BDFDB.ReactUtils.createElement("div", {
												className: BDFDB.disCN.dateinputpreview,
												children: [
													input.props.prefix && BDFDB.ReactUtils.createElement("div", {
														className: BDFDB.disCN.dateinputpreviewprefix,
														children: typeof input.props.prefix == "function" ? input.props.prefix(input) : input.props.prefix,
													}),
													BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextScroller, {
														children: Internal.LibraryComponents.DateInput.format(input.props, new Date((new Date()) - (1000*60*60*24*2)))
													}),
													input.props.suffix && BDFDB.ReactUtils.createElement("div", {
														className: BDFDB.disCN.dateinputpreviewsuffix,
														children: typeof input.props.suffix == "function" ? input.props.suffix(input) : input.props.suffix,
													})
												].filter(n => n)
											});
										}
									})
								]
							})
						]
					}), "onChange", "label", "formatString", "dateString", "timeString", "timeOffset", "language", "noPreview", "prefix", "suffix"));
				}
			};
			CustomComponents.DateInput.getDefaultString = function (language) {
				language = language || BDFDB.LanguageUtils.getLanguage().id;
				const date = new Date();
				return date.toLocaleString(language).replace(date.toLocaleDateString(language), "$date").replace(date.toLocaleTimeString(language, {hourCycle: "h12"}), "$time12").replace(date.toLocaleTimeString(language, {hourCycle: "h11"}), "$time12").replace(date.toLocaleTimeString(language, {hourCycle: "h24"}), "$time").replace(date.toLocaleTimeString(language, {hourCycle: "h23"}), "$time");
			};
			CustomComponents.DateInput.parseDate = function (date, offset) {
				let timeObj = date;
				if (typeof timeObj == "string") {
					const language = BDFDB.LanguageUtils.getLanguage().id;
					for (let i = 0; i < 12; i++) {
						const tempDate = new Date();
						tempDate.setMonth(i);
						timeObj = timeObj.replace(tempDate.toLocaleDateString(language, {month:"long"}), tempDate.toLocaleDateString("en", {month:"short"}));
					}
					timeObj = new Date(timeObj);
				}
				else if (typeof timeObj == "number") timeObj = new Date(timeObj);
				
				if (timeObj.toString() == "Invalid Date") timeObj = new Date(parseInt(date));
				if (timeObj.toString() == "Invalid Date" || typeof timeObj.toLocaleDateString != "function") timeObj = new Date();
				offset = offset != null && parseFloat(offset);
				if ((offset || offset === 0) && !isNaN(offset)) timeObj = new Date(timeObj.getTime() + ((offset - timeObj.getTimezoneOffset() * (-1/60)) * 60*60*1000));
				return timeObj;
			};
			CustomComponents.DateInput.format = function (data, time) {
				if (typeof data == "string") data = {formatString: data};
				if (data && typeof data.formatString != "string") data.formatString = "";
				if (!data || typeof data.formatString != "string" || !time) return "";
				
				const language = data.language || BDFDB.LanguageUtils.getLanguage().id;
				const timeObj = Internal.LibraryComponents.DateInput.parseDate(time, data.timeOffset);
				const now = new Date();
				const daysAgo = Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(timeObj.getFullYear(), timeObj.getMonth(), timeObj.getDate()))/(1000*60*60*24));
				const date = data.dateString && typeof data.dateString == "string" ? Internal.LibraryComponents.DateInput.formatDate({dateString: data.dateString, language: language}, timeObj) : timeObj.toLocaleDateString(language);
				
				return (data.formatString || Internal.LibraryComponents.DateInput.getDefaultString(language))
					.replace(/\$date/g, date)
					.replace(/\$time12/g, data.timeString && typeof data.timeString == "string" ? Internal.LibraryComponents.DateInput.formatTime({timeString: data.timeString, language: language}, timeObj, true) : timeObj.toLocaleTimeString(language, {hourCycle: "h12"}))
					.replace(/\$time/g, data.timeString && typeof data.timeString == "string" ? Internal.LibraryComponents.DateInput.formatTime({timeString: data.timeString, language: language}, timeObj) : timeObj.toLocaleTimeString(language, {hourCycle: "h23"}))
					.replace(/\$monthS/g, timeObj.toLocaleDateString(language, {month: "short"}))
					.replace(/\$month/g, timeObj.toLocaleDateString(language, {month: "long"}))
					.replace(/\$dayS/g, timeObj.toLocaleDateString(language, {weekday: "short"}))
					.replace(/\$day/g, timeObj.toLocaleDateString(language, {weekday: "long"}))
					.replace(/\$agoAmount/g, daysAgo < 0 ? "" : daysAgo > 1 ? Internal.DiscordObjects.Timestamp(timeObj.getTime()).fromNow() : BDFDB.LanguageUtils.LanguageStrings[`SEARCH_SHORTCUT_${daysAgo == 1 ? "YESTERDAY" : "TODAY"}`])
					.replace(/\$agoDays/g, daysAgo < 0 ? "" : daysAgo > 1 ? BDFDB.LanguageUtils.LanguageStringsFormat(`GAME_LIBRARY_LAST_PLAYED_DAYS`, daysAgo) : BDFDB.LanguageUtils.LanguageStrings[`SEARCH_SHORTCUT_${daysAgo == 1 ? "YESTERDAY" : "TODAY"}`])
					.replace(/\$agoDate/g, daysAgo < 0 ? "" : daysAgo > 1 ? date : BDFDB.LanguageUtils.LanguageStrings[`SEARCH_SHORTCUT_${daysAgo == 1 ? "YESTERDAY" : "TODAY"}`])
					.replace(/\(\)|\[\]/g, "").replace(/,\s*$|^\s*,/g, "").replace(/ +/g, " ").trim();
			};
			CustomComponents.DateInput.formatDate = function (data, time) {
				if (typeof data == "string") data = {dateString: data};
				if (data && typeof data.dateString != "string") return "";
				if (!data || typeof data.dateString != "string" || !data.dateString || !time) return "";
				
				const language = data.language || BDFDB.LanguageUtils.getLanguage().id;
				const timeObj = Internal.LibraryComponents.DateInput.parseDate(time, data.timeOffset);
				
				return data.dateString
					.replace(/\$monthS/g, timeObj.toLocaleDateString(language, {month: "short"}))
					.replace(/\$month/g, timeObj.toLocaleDateString(language, {month: "long"}))
					.replace(/\$dd/g, timeObj.toLocaleDateString(language, {day: "2-digit"}))
					.replace(/\$d/g, timeObj.toLocaleDateString(language, {day: "numeric"}))
					.replace(/\$mm/g, timeObj.toLocaleDateString(language, {month: "2-digit"}))
					.replace(/\$m/g, timeObj.toLocaleDateString(language, {month: "numeric"}))
					.replace(/\$yyyy/g, timeObj.toLocaleDateString(language, {year: "numeric"}))
					.replace(/\$yy/g, timeObj.toLocaleDateString(language, {year: "2-digit"}))
					.trim();
			};
			CustomComponents.DateInput.formatTime = function (data, time, hour12) {
				if (typeof data == "string") data = {timeString: data};
				if (data && typeof data.timeString != "string") return "";
				if (!data || typeof data.timeString != "string" || !data.timeString || !time) return "";
				
				const language = data.language || BDFDB.LanguageUtils.getLanguage().id;
				const timeObj = Internal.LibraryComponents.DateInput.parseDate(time, data.timeOffset);
				
				let hours = timeObj.getHours();
				if (hour12) {
					hours = hours == 0 ? 12 : hours;
					if (hours > 12) hours -= 12;
				}
				const minutes = timeObj.getMinutes();
				const seconds = timeObj.getSeconds();
				const milli = timeObj.getMilliseconds();
				
				let string = data.timeString
					.replace(/\$hh/g, hours < 10 ? `0${hours}` : hours)
					.replace(/\$h/g, hours)
					.replace(/\$mm/g, minutes < 10 ? `0${minutes}` : minutes)
					.replace(/\$m/g, minutes)
					.replace(/\$ss/g, seconds < 10 ? `0${seconds}` : seconds)
					.replace(/\$s/g, seconds)
					.replace(/\$uu/g, milli < 10 ? `00${seconds}` : milli < 100 ? `0${milli}` : milli)
					.replace(/\$u/g, milli)
					.trim();

				let digits = "\\d";
				if (BDFDB.LanguageUtils.languages[language] && BDFDB.LanguageUtils.languages[language].numberMap) {
					digits = Object.entries(BDFDB.LanguageUtils.languages[language].numberMap).map(n => n[1]).join("");
					for (let number in BDFDB.LanguageUtils.languages[language].numberMap) string = string.replace(new RegExp(number, "g"), BDFDB.LanguageUtils.languages[language].numberMap[number]);
				}
				return hour12 ? timeObj.toLocaleTimeString(language, {hourCycle: "h12"}).replace(new RegExp(`[${digits}]{1,2}[^${digits}][${digits}]{1,2}[^${digits}][${digits}]{1,2}`, "g"), string) : string;
			};
			
			CustomComponents.EmojiPickerButton = reactInitialized && class BDFDB_EmojiPickerButton extends Internal.LibraryModules.React.Component {
				handleEmojiChange(emoji) {
					if (emoji != null) {
						this.props.emoji = emoji.id ? {
							id: emoji.id,
							name: emoji.name,
							animated: emoji.animated
						} : {
							id: null,
							name: emoji.optionallyDiverseSequence,
							animated: false
						};
						if (typeof this.props.onSelect == "function") this.props.onSelect(this.props.emoji, this);
						if (typeof this.close == "function" && !BDFDB.ListenerUtils.isPressed(16)) this.close();
						BDFDB.ReactUtils.forceUpdate(this);
					}
				}
				render() {
					let button = this;
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutContainer, {
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.EmojiButton, {
							className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.emojiinputbutton),
							renderButtonContents: this.props.emoji ? _ => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Emoji, {
								className: BDFDB.disCN.emoji,
								emojiId: this.props.emoji.id,
								emojiName: this.props.emoji.name
							}) : null
						}),
						wrap: false,
						animation: Internal.LibraryComponents.PopoutContainer.Animation.NONE,
						position: Internal.LibraryComponents.PopoutContainer.Positions.TOP,
						align: Internal.LibraryComponents.PopoutContainer.Align.LEFT,
						renderPopout: instance => {
							this.close = instance.close;
							return [
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.EmojiPicker, {
									closePopout: this.close,
									onSelectEmoji: this.handleEmojiChange.bind(this),
									allowManagedEmojis: this.props.allowManagedEmojis,
									allowManagedEmojisUsage: this.props.allowManagedEmojisUsage
								}),
								BDFDB.ReactUtils.createElement(class extends Internal.LibraryModules.React.Component {
									componentDidMount() {Internal.LibraryComponents.EmojiPickerButton.current = button;}
									componentWillUnmount() {delete Internal.LibraryComponents.EmojiPickerButton.current;}
									render() {return null;}
								})
							];
						}
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.EmojiPickerButton, {allowManagedEmojis: false, allowManagedEmojisUsage: false});
			
			CustomComponents.FavButton = reactInitialized && class BDFDB_FavButton extends Internal.LibraryModules.React.Component {
				handleClick() {
					this.props.isFavorite = !this.props.isFavorite;
					if (typeof this.props.onClick == "function") this.props.onClick(this.props.isFavorite, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.favbuttoncontainer, BDFDB.disCN.favbutton, this.props.isFavorite && BDFDB.disCN.favbuttonselected, this.props.className),
						onClick: this.handleClick.bind(this),
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
							name: Internal.LibraryComponents.SvgIcon.Names[this.props.isFavorite ? "FAVORITE_FILLED" : "FAVORITE"],
							width: this.props.width || 24,
							height: this.props.height || 24,
							className: BDFDB.disCN.favbuttonicon
						})
					});
				}
			};
			
			CustomComponents.FileButton = reactInitialized && class BDFDB_FileButton extends Internal.LibraryModules.React.Component {
				componentDidMount() {
					if (this.props.searchFolders) {
						let node = BDFDB.ReactUtils.findDOMNode(this);
						if (node && (node = node.querySelector("input[type='file']")) != null) {
							node.setAttribute("directory", "");
							node.setAttribute("webkitdirectory", "");
						}
					}
				}
				render() {
					let filter = this.props.filter && [this.props.filter].flat(10).filter(n => typeof n == "string") || [];
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Button, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						onClick: e => {e.currentTarget.querySelector("input").click();},
						children: [
							BDFDB.LanguageUtils.LibraryStrings.file_navigator_text,
							BDFDB.ReactUtils.createElement("input", {
								type: "file",
								accept: filter.length && (filter.join("/*,") + "/*"),
								style: {display: "none"},
								onChange: e => {
									let file = e.currentTarget.files[0];
									if (this.refInput && file && (!filter.length || filter.some(n => file.type.indexOf(n) == 0))) {
										this.refInput.props.value = this.props.searchFolders ? file.path.split(file.name).slice(0, -1).join(file.name) : `${this.props.mode == "url" ? "url('" : ""}${(this.props.useFilePath) ? file.path : `data:${file.type};base64,${Internal.LibraryRequires.fs.readFileSync(file.path).toString("base64")}`}${this.props.mode ? "')" : ""}`;
										BDFDB.ReactUtils.forceUpdate(this.refInput);
										this.refInput.handleChange(this.refInput.props.value);
									}
								}
							})
						]
					}), "filter", "mode", "useFilePath", "searchFolders"));
				}
			};
			
			CustomComponents.FormComponents = {};
			CustomComponents.FormComponents.FormItem = reactInitialized && class BDFDB_FormItem extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement("div", {
						className: this.props.className,
						style: this.props.style,
						children: [
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
								align: Internal.LibraryComponents.Flex.Align.BASELINE,
								children: [
									this.props.title != null || this.props.error != null ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
										wrap: true,
										children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormTitle, {
											tag: this.props.tag || Internal.LibraryComponents.FormComponents.FormTitle.Tags.H5,
											disabled: this.props.disabled,
											required: this.props.required,
											error: this.props.error,
											className: this.props.titleClassName,
											children: this.props.title
										})
									}) : null
								].concat([this.props.titleChildren].flat(10)).filter(n => n)
							}),
						].concat(this.props.children)
					});
				}
			};
			
			CustomComponents.GuildComponents = {};
			CustomComponents.GuildComponents.Guild = reactInitialized && class BDFDB_Guild extends Internal.LibraryModules.React.Component {
				constructor(props) {
					super(props);
					this.state = {hovered: false};
				}
				handleMouseEnter(e) {
					if (!this.props.sorting) this.setState({hovered: true});
					if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);
				}
				handleMouseLeave(e) {
					if (!this.props.sorting) this.setState({hovered: false});
					if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);
				}
				handleMouseDown(e) {
					if (!this.props.unavailable && this.props.guild && this.props.selectedChannelId) Internal.LibraryModules.DirectMessageUtils.preload(this.props.guild.id, this.props.selectedChannelId);
					if (e.button == 0 && typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);
				}
				handleMouseUp(e) {
					if (e.button == 0 && typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);
				}
				handleClick(e) {
					if (typeof this.props.onClick == "function") this.props.onClick(e, this);
				}
				handleContextMenu(e) {
					if (this.props.menu) BDFDB.GuildUtils.openMenu(this.props.guild, e);
					if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
				}
				setRef(e) {
					if (typeof this.props.setRef == "function") this.props.setRef(this.props.guild.id, e)
				}
				componentDidMount() {
					let node = BDFDB.ReactUtils.findDOMNode(this);
					if (node && node.nodeType != Node.TEXT_NODE) for (let child of node.querySelectorAll("a")) child.setAttribute("draggable", false);
				}
				render() {
					if (!this.props.guild) return null;
					
					this.props.guildId = this.props.guild.id;
					this.props.selectedChannelId = Internal.LibraryModules.LastChannelStore.getChannelId(this.props.guild.id);
					
					let currentVoiceChannel = Internal.LibraryModules.ChannelStore.getChannel(Internal.LibraryModules.CurrentVoiceUtils.getChannelId());
					let hasVideo = currentVoiceChannel && Internal.LibraryModules.VoiceUtils.hasVideo(currentVoiceChannel);
					
					this.props.selected = this.props.state ? Internal.LibraryModules.LastGuildStore.getGuildId() == this.props.guild.id : false;
					this.props.unread = this.props.state ? Internal.LibraryModules.UnreadGuildUtils.hasUnread(this.props.guild.id) : false;
					this.props.badge = this.props.state ? Internal.LibraryModules.UnreadGuildUtils.getMentionCount(this.props.guild.id) : 0;
					
					this.props.mediaState = Object.assign({}, this.props.mediaState, {
						audio: this.props.state ? currentVoiceChannel && currentVoiceChannel.guild_id == this.props.guild.id && !hasVideo : false,
						video: this.props.state ? currentVoiceChannel && currentVoiceChannel.guild_id == this.props.guild.id && hasVideo : false,
						screenshare: this.props.state ? !!Internal.LibraryModules.StreamUtils.getAllApplicationStreams().filter(stream => stream.guildId == this.props.guild.id)[0] : false,
						liveStage: this.props.state ? Object.keys(Internal.LibraryModules.StageChannelStore.getStageInstancesByGuild(this.props.guild.id)).length > 0 : false,
						hasLiveVoiceChannel: this.props.state && false ? !Internal.LibraryModules.MutedUtils.isMuted(this.props.guild.id) && BDFDB.ObjectUtils.toArray(Internal.LibraryModules.VoiceUtils.getVoiceStates(this.props.guild.id)).length > 0 : false,
						participating: this.props.state ? Internal.LibraryModules.CurrentVoiceUtils.getGuildId() == this.props.guild.id : false,
						participatingInStage: this.props.state ? currentVoiceChannel && currentVoiceChannel.guild_id == this.props.guild.id && currentVoiceChannel.isGuildStageVoice() : false
					});
					
					this.props.animatable = this.props.state ? this.props.guild.icon && Internal.LibraryModules.IconUtils.isAnimatedIconHash(this.props.guild.icon) : false;
					this.props.unavailable = this.props.state ? Internal.LibraryModules.GuildUnavailableStore.unavailableGuilds.includes(this.props.guild.id) : false;
				
					let isDraggedGuild = this.props.draggingGuildId === this.props.guild.id;
					let guild = isDraggedGuild ? BDFDB.ReactUtils.createElement("div", {
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.DragPlaceholder, {})
					}) : BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.guildcontainer,
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.BlobMask, {
							selected: this.state.isDropHovering || this.props.selected || this.state.hovered,
							upperBadge: this.props.unavailable ? Internal.LibraryModules.GuildBadgeUtils.renderUnavailableBadge() : Internal.LibraryModules.GuildBadgeUtils.renderMediaBadge(this.props.mediaState),
							lowerBadge: this.props.badge > 0 ? Internal.LibraryModules.GuildBadgeUtils.renderMentionBadge(this.props.badge) : null,
							lowerBadgeWidth: Internal.LibraryComponents.Badges.getBadgeWidthForValue(this.props.badge),
							children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.NavItem, {
								to: {
									pathname: BDFDB.DiscordConstants.Routes.CHANNEL(this.props.guild.id, this.props.selectedChannelId),
									state: {
										analyticsSource: {
											page: BDFDB.DiscordConstants.AnalyticsPages.GUILD_CHANNEL,
											section: BDFDB.DiscordConstants.AnalyticsSections.CHANNEL_LIST,
											object: BDFDB.DiscordConstants.AnalyticsObjects.CHANNEL
										}
									}
								},
								name: this.props.guild.name,
								onMouseEnter: this.handleMouseEnter.bind(this),
								onMouseLeave: this.handleMouseLeave.bind(this),
								onMouseDown: this.handleMouseDown.bind(this),
								onMouseUp: this.handleMouseUp.bind(this),
								onClick: this.handleClick.bind(this),
								onContextMenu: this.handleContextMenu.bind(this),
								icon: this.props.guild.getIconURL(this.props.iconSize || 96, this.state.hovered && this.props.animatable),
								selected: this.props.selected || this.state.hovered
							})
						})
					});
					
					let children = [
						this.props.list || this.props.pill ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.Pill, {
							hovered: !isDraggedGuild && this.state.hovered,
							selected: !isDraggedGuild && this.props.selected,
							unread: !isDraggedGuild && this.props.unread,
							className: BDFDB.disCN.guildpill
						}) : null,
						!this.props.tooltip ? guild : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
							tooltipConfig: Object.assign({type: "right"}, this.props.tooltipConfig, {guild: this.props.list && this.props.guild}),
							children: guild
						})
					].filter(n => n);
					return this.props.list ? BDFDB.ReactUtils.createElement("div", {
						ref: null != this.props.setRef ? this.props.setRef : null,
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.guildouter, BDFDB.disCN._bdguild, this.props.unread && BDFDB.disCN._bdguildunread, this.props.selected && BDFDB.disCN._bdguildselected, this.props.unread && BDFDB.disCN._bdguildunread, this.props.audio && BDFDB.disCN._bdguildaudio, this.props.video && BDFDB.disCN._bdguildvideo),
						children: BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
							children: children
						})
					}) : BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.guild, this.props.className),
						children: children
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.GuildComponents.Guild, {menu: true, tooltip: true, list: false, state: false, draggable: false, sorting: false});
			
			CustomComponents.GuildSummaryItem = reactInitialized && class BDFDB_GuildSummaryItem extends Internal.LibraryModules.React.Component {
				defaultRenderGuild(guild, isLast) {
					if (!guild) return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.guildsummaryemptyguild
					});
					let icon = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.Icon, {
						className: BDFDB.disCN.guildsummaryicon,
						guild: guild,
						showTooltip: this.props.showTooltip,
						tooltipPosition: "top",
						size: Internal.LibraryComponents.GuildComponents.Icon.Sizes.SMALLER
					});
					return this.props.switchOnClick ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
						className: BDFDB.disCN.guildsummaryclickableicon,
						onClick: _ => Internal.LibraryModules.HistoryUtils.transitionTo(BDFDB.DiscordConstants.Routes.CHANNEL(guild.id, Internal.LibraryModules.LastChannelStore.getChannelId(guild.id))),
						key: guild.id,
						tabIndex: -1,
						children: icon
					}) : icon;
				}
				renderGuilds() {
					let elements = [];
					let renderGuild = typeof this.props.renderGuild != "function" ? this.defaultRenderGuild : this.props.renderGuild;
					let loaded = 0, max = this.props.guilds.length === this.props.max ? this.props.guilds.length : this.props.max - 1;
					while (loaded < max && loaded < this.props.guilds.length) {
						let isLast = loaded === this.props.guilds.length - 1;
						let guild = renderGuild.apply(this, [this.props.guilds[loaded], isLast]);
						elements.push(BDFDB.ReactUtils.createElement("div", {
							className: isLast ? BDFDB.disCN.guildsummaryiconcontainer : BDFDB.disCN.guildsummaryiconcontainermasked,
							children: guild
						}));
						loaded++;
					}
					if (loaded < this.props.guilds.length) {
						let rest = Math.min(this.props.guilds.length - loaded, 99);
						elements.push(BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
							key: "more-guilds",
							children: this.props.renderMoreGuilds("+" + rest, rest, this.props.guilds.slice(loaded), this.props)
						}));
					}
					return elements;
				}
				renderIcon() {
					return this.props.renderIcon ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
						name: Internal.LibraryComponents.SvgIcon.Names.WHATISTHIS,
						className: BDFDB.disCN.guildsummarysvgicon
					}) : null;
				}
				render() {
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.guildsummarycontainer),
						ref: this.props._ref,
						children: [
							this.renderIcon.apply(this),
							this.renderGuilds.apply(this)
						].flat(10).filter(n => n)
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.GuildSummaryItem, {max: 10, renderMoreGuilds: (count, amount, restGuilds, props) => {
				let icon = BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN.guildsummarymoreguilds, children: count});
				return props.showTooltip ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
					text: restGuilds.map(guild => guild.name).join(", "),
					children: icon
				}) : icon;
			}, renderIcon: false});
			
			CustomComponents.GuildVoiceList = reactInitialized && class BDFDB_GuildVoiceList extends Internal.LibraryModules.React.Component {
				render() {
					let channels = Internal.LibraryModules.GuildChannelStore.getChannels(this.props.guild.id);
					let voiceChannels = (channels[Internal.LibraryModules.GuildChannelKeys.GUILD_VOCAL_CHANNELS_KEY] || []).filter(c => c.channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_VOICE).map(c => c.channel.id);
					let stageChannels = (channels[Internal.LibraryModules.GuildChannelKeys.GUILD_VOCAL_CHANNELS_KEY] || []).filter(c => c.channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_STAGE_VOICE && Internal.LibraryModules.StageChannelStore.getStageInstanceByChannel(c.channel.id)).map(c => c.channel.id);
					let streamOwnerIds = Internal.LibraryModules.StreamUtils.getAllApplicationStreams().filter(app => app.guildId === this.props.guild.id).map(app => app.ownerId) || [];
					let streamOwners = streamOwnerIds.map(ownerId => Internal.LibraryModules.UserStore.getUser(ownerId)).filter(n => n);
					let connectedVoiceUsers = BDFDB.ObjectUtils.toArray(Internal.LibraryModules.VoiceUtils.getVoiceStates(this.props.guild.id)).map(state => voiceChannels.includes(state.channelId) && state.channelId != this.props.guild.afkChannelId && !streamOwnerIds.includes(state.userId) && Internal.LibraryModules.UserStore.getUser(state.userId)).filter(n => n);
					let connectedStageUsers = BDFDB.ObjectUtils.toArray(Internal.LibraryModules.VoiceUtils.getVoiceStates(this.props.guild.id)).map(state => stageChannels.includes(state.channelId) && state.channelId != this.props.guild.afkChannelId && !streamOwnerIds.includes(state.userId) && Internal.LibraryModules.UserStore.getUser(state.userId)).filter(n => n);
					let children = [
						!connectedStageUsers.length ? null : BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.tooltiprow,
							children: [
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
									name: Internal.LibraryComponents.SvgIcon.Names.PODIUM,
									className: BDFDB.disCN.tooltipactivityicon
								}),
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.UserSummaryItem, {
									users: connectedStageUsers,
									max: 6
								})
							]
						}),
						!connectedVoiceUsers.length ? null : BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.tooltiprow,
							children: [
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
									name: Internal.LibraryComponents.SvgIcon.Names.SPEAKER,
									className: BDFDB.disCN.tooltipactivityicon
								}),
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.UserSummaryItem, {
									users: connectedVoiceUsers,
									max: 6
								})
							]
						}),
						!streamOwners.length ? null : BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.tooltiprow,
							children: [
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
									name: Internal.LibraryComponents.SvgIcon.Names.STREAM,
									className: BDFDB.disCN.tooltipactivityicon
								}),
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.UserSummaryItem, {
									users: streamOwners,
									max: 6
								})
							]
						})
					].filter(n => n);
					return !children.length ? null : BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.guildvoicelist,
						children: children
					});
				}
			};
			
			CustomComponents.KeybindRecorder = reactInitialized && class BDFDB_KeybindRecorder extends Internal.LibraryModules.React.Component {
				handleChange(arrays) {
					this.props.value = arrays.map(platformKey => Internal.LibraryModules.KeyEvents.codes[Internal.LibraryModules.KeyCodeUtils.codeToKey(platformKey)] || platformKey[1]);
					if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
				}
				handleReset() {
					this.props.value = [];
					if (this.recorder) this.recorder.setState({codes: []});
					if (typeof this.props.onChange == "function") this.props.onChange([], this);
					if (typeof this.props.onReset == "function") this.props.onReset(this);
				}
				componentDidMount() {
					if (!this.recorder) this.recorder = BDFDB.ReactUtils.findOwner(this, {name: "KeybindRecorder"});
				}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
						className: BDFDB.disCN.hotkeywrapper,
						direction: Internal.LibraryComponents.Flex.Direction.HORIZONTAL,
						align: Internal.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.KeybindRecorder, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
								defaultValue: [this.props.defaultValue || this.props.value].flat(10).filter(n => n).map(keyCode => [BDFDB.DiscordConstants.KeyboardDeviceTypes.KEYBOARD_KEY, Internal.LibraryModules.KeyCodeUtils.keyToCode((Object.entries(Internal.LibraryModules.KeyEvents.codes).find(n => n[1] == keyCode && Internal.LibraryModules.KeyCodeUtils.keyToCode(n[0], null)) || [])[0], null) || keyCode]),
								onChange: this.handleChange.bind(this)
							}), "reset", "onReset")),
							this.props.reset || this.props.onReset ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
								text: BDFDB.LanguageUtils.LanguageStrings.REMOVE_KEYBIND,
								tooltipConfig: {type: "top"},
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
									className: BDFDB.disCN.hotkeyresetbutton,
									onClick: this.handleReset.bind(this),
									children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
										iconSVG: `<svg height="20" width="20" viewBox="0 0 20 20"><path fill="currentColor" d="M 14.348 14.849 c -0.469 0.469 -1.229 0.469 -1.697 0 l -2.651 -3.030 -2.651 3.029 c -0.469 0.469 -1.229 0.469 -1.697 0 -0.469 -0.469 -0.469 -1.229 0 -1.697l2.758 -3.15 -2.759 -3.152 c -0.469 -0.469 -0.469 -1.228 0 -1.697 s 1.228 -0.469 1.697 0 l 2.652 3.031 2.651 -3.031 c 0.469 -0.469 1.228 -0.469 1.697 0 s 0.469 1.229 0 1.697l -2.758 3.152 2.758 3.15 c 0.469 0.469 0.469 1.229 0 1.698 z"></path></svg>`,
									})
								})
							}) : null
						].filter(n => n)
					});
				}
			};
			
			CustomComponents.ListRow = reactInitialized && class BDFDB_ListRow extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement("div", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listrowwrapper, this.props.className, BDFDB.disCN.listrow),
						children: [
							this.props.prefix,
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.listrowcontent,
								style: {flex: "1 1 auto"},
								children: [
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listname, this.props.labelClassName),
										style: {flex: "1 1 auto"},
										children: this.props.label
									}),
									typeof this.props.note == "string" ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormText, {
										type: Internal.LibraryComponents.FormComponents.FormText.Types.DESCRIPTION,
										children: this.props.note
									}) : null
								].filter(n => n)
							}),
							this.props.suffix
						].filter(n => n)
					}), "label", "note", "suffix", "prefix", "labelClassName"));
				}
			};
			
			CustomComponents.MemberRole = reactInitialized && class BDFDB_MemberRole extends Internal.LibraryModules.React.Component {
				handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
				handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
				render() {
					let color = BDFDB.ColorUtils.convert(this.props.role.colorString, "RGB") || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_300;
					return BDFDB.ReactUtils.createElement("li", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.userpopoutrole, this.props.className),
						style: {borderColor: BDFDB.ColorUtils.setAlpha(color, 0.6)},
						onClick: this.handleClick.bind(this),
						onContextMenu: this.handleContextMenu.bind(this),
						children: [
							!this.props.noCircle ? BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.userpopoutrolecircle,
								style: {backgroundColor: color}
							}) : null,
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.userpopoutrolename,
								children: this.props.role.name
							})
						].filter(n => n)
					});
				}
			};
			
			CustomComponents.MenuItems = {};
			CustomComponents.MenuItems.MenuCheckboxItem = reactInitialized && class BDFDB_MenuCheckboxItem extends Internal.LibraryModules.React.Component {
				handleClick() {
					if (this.props.state) {
						this.props.state.checked = !this.props.state.checked;
						if (typeof this.props.action == "function") this.props.action(this.props.state.checked, this);
					}
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.MenuCheckboxItem, Object.assign({}, this.props, {
						checked: this.props.state && this.props.state.checked,
						action: this.handleClick.bind(this)
					}));
				}
			};
			
			CustomComponents.MenuItems.MenuHint = reactInitialized && class BDFDB_MenuHint extends Internal.LibraryModules.React.Component {
				render() {
					return !this.props.hint ? null : BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.menuhint,
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextScroller, {
							children: this.props.hint
						})
					});
				}
			};
			
			CustomComponents.MenuItems.MenuIcon = reactInitialized && class BDFDB_MenuIcon extends Internal.LibraryModules.React.Component {
				render() {
					let isString = typeof this.props.icon == "string";
					return !this.props.icon ? null : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.menuicon,
						nativeClass: true,
						iconSVG: isString ? this.props.icon : null,
						name: !isString ? this.props.icon : null
					});
				}
			};
			
			CustomComponents.MenuItems.MenuSliderItem = reactInitialized && class BDFDB_MenuSliderItem extends Internal.LibraryModules.React.Component {
				handleValueChange(value) {
					if (this.props.state) {
						this.props.state.value = Math.round(BDFDB.NumberUtils.mapRange([0, 100], [this.props.minValue, this.props.maxValue], value) * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
						if (typeof this.props.onValueChange == "function") this.props.onValueChange(this.props.state.value, this);
					}
					BDFDB.ReactUtils.forceUpdate(this);
				}
				handleValueRender(value) {
					let newValue = Math.round(BDFDB.NumberUtils.mapRange([0, 100], [this.props.minValue, this.props.maxValue], value) * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
					if (typeof this.props.onValueRender == "function") {
						let tempReturn = this.props.onValueRender(newValue, this);
						if (tempReturn != undefined) newValue = tempReturn;
					}
					return newValue;
				}
				render() {
					let value = this.props.state && this.props.state.value || 0;
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.MenuControlItem, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						label: typeof this.props.renderLabel == "function" ? this.props.renderLabel(Math.round(value * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits), this) : this.props.label,
						control: (menuItemProps, ref) => {
							return BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.menuslidercontainer,
								children: BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.Slider, Object.assign({}, menuItemProps, {
									ref: ref,
									className: BDFDB.disCN.menuslider,
									mini: true,
									initialValue: Math.round(BDFDB.NumberUtils.mapRange([this.props.minValue, this.props.maxValue], [0, 100], value) * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits),
									onValueChange: this.handleValueChange.bind(this),
									onValueRender: this.handleValueRender.bind(this)
								}))
							});
						}
					}), "digits", "renderLabel"));
				}
			};
			Internal.setDefaultProps(CustomComponents.MenuItems.MenuSliderItem, {minValue: 0, maxValue: 100, digits: 0});
			
			CustomComponents.ModalComponents = {};
			CustomComponents.ModalComponents.ModalContent = reactInitialized && class BDFDB_ModalContent extends Internal.LibraryModules.React.Component {
				render() {
					return this.props.scroller ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Scrollers.Thin, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modalcontent, this.props.className),
						ref: this.props.scrollerRef,
						children: this.props.children
					}) : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
						className: BDFDB.DOMUtils.formatClassName(this.props.content && BDFDB.disCN.modalcontent, BDFDB.disCN.modalnoscroller, this.props.className),
						direction: this.props.direction || Internal.LibraryComponents.Flex.Direction.VERTICAL,
						align: Internal.LibraryComponents.Flex.Align.STRETCH,
						children: this.props.children
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.ModalComponents.ModalContent, {scroller: true, content: true});
			
			CustomComponents.ModalComponents.ModalTabContent = reactInitialized && class BDFDB_ModalTabContent extends Internal.LibraryModules.React.Component {
				render() {
					return !this.props.open ? null : BDFDB.ReactUtils.createElement(this.props.scroller ? Internal.LibraryComponents.Scrollers.Thin : "div", Object.assign(BDFDB.ObjectUtils.exclude(this.props, "scroller", "open"), {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modaltabcontent, this.props.open && BDFDB.disCN.modaltabcontentopen, this.props.className),
						children: this.props.children
					}));
				}
			};
			Internal.setDefaultProps(CustomComponents.ModalComponents.ModalTabContent, {tab: "unnamed"});
			
			CustomComponents.ModalComponents.ModalFooter = reactInitialized && class BDFDB_ModalFooter extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modalfooter, this.props.className),
						direction: this.props.direction || Internal.LibraryComponents.Flex.Direction.HORIZONTAL_REVERSE,
						align: Internal.LibraryComponents.Flex.Align.STRETCH,
						grow: 0,
						shrink: 0,
						children: this.props.children
					});
				}
			};
			
			CustomComponents.MultiInput = reactInitialized && class BDFDB_MultiInput extends Internal.LibraryModules.React.Component {
				constructor(props) {
					super(props);
					this.state = {focused: false};
				}
				render() {
					if (this.props.children && this.props.children.props) this.props.children.props.className = BDFDB.DOMUtils.formatClassName(this.props.children.props.className, BDFDB.disCN.inputmultifield);
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.inputwrapper, BDFDB.disCN.inputmultiwrapper),
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.input, BDFDB.disCN.inputmulti, this.state.focused && BDFDB.disCN.inputfocused),
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.DOMUtils.formatClassName(this.props.innerClassName, BDFDB.disCN.inputwrapper, BDFDB.disCN.inputmultifirst),
									children: this.props.children
								}),
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextInput, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
									className: BDFDB.disCN.inputmultilast,
									inputClassName: BDFDB.disCN.inputmultifield,
									onFocus: e => this.setState({focused: true}),
									onBlur: e => this.setState({focused: false})
								}), "children", "innerClassName"))
							]
						})
					});
				}
			};
			
			CustomComponents.ListInput = reactInitialized && class BDFDB_ListInput extends Internal.LibraryModules.React.Component {
				handleChange() {
					if (typeof this.props.onChange) this.props.onChange(this.props.items, this);
				}
				render() {
					if (!BDFDB.ArrayUtils.is(this.props.items)) this.props.items = [];
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.MultiInput, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.disCN.inputlist,
						innerClassName: BDFDB.disCN.inputlistitems,
						onKeyDown: e => {
							if (e.which == 13 && e.target.value && e.target.value.trim()) {
								let value = e.target.value.trim();
								this.props.value = "";
								if (!this.props.items.includes(value)) {
									this.props.items.push(value);
									BDFDB.ReactUtils.forceUpdate(this);
									this.handleChange.apply(this, []);
								}
							}
						},
						children: this.props.items.map(item => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Badges.TextBadge, {
							className: BDFDB.disCN.inputlistitem,
							color: "var(--bdfdb-blurple)",
							style: {borderRadius: "3px"},
							text: [
								item,
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.inputlistdelete,
									name: Internal.LibraryComponents.SvgIcon.Names.CLOSE,
									onClick: _ => {
										BDFDB.ArrayUtils.remove(this.props.items, item);
										BDFDB.ReactUtils.forceUpdate(this);
										this.handleChange.apply(this, []);
									}
								})
							]
						}))
					}), "items"));
				}
			};
			
			CustomComponents.PaginatedList = reactInitialized && class BDFDB_PaginatedList extends Internal.LibraryModules.React.Component {
				constructor(props) {
					super(props);
					this.state = {
						offset: props.offset
					};
				}
				handleJump(offset) {
					if (offset > -1 && offset < Math.ceil(this.props.items.length/this.props.amount) && this.state.offset != offset) {
						this.state.offset = offset;
						if (typeof this.props.onJump == "function") this.props.onJump(offset, this);
						BDFDB.ReactUtils.forceUpdate(this);
					}
				}
				renderPagination(bottom) {
					let maxOffset = Math.ceil(this.props.items.length/this.props.amount) - 1;
					return this.props.items.length > this.props.amount && BDFDB.ReactUtils.createElement("nav", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.pagination, bottom ? BDFDB.disCN.paginationbottom : BDFDB.disCN.paginationtop, this.props.mini && BDFDB.disCN.paginationmini),
						children: [
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Paginator, {
								totalCount: this.props.items.length,
								currentPage: this.state.offset + 1,
								pageSize: this.props.amount,
								maxVisiblePages: this.props.maxVisiblePages,
								onPageChange: page => {this.handleJump(isNaN(parseInt(page)) ? -1 : page - 1);}
							}),
							this.props.jump && BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextInput, {
								type: "number",
								size: Internal.LibraryComponents.TextInput.Sizes.MINI,
								value: this.state.offset + 1,
								min: 1,
								max: maxOffset + 1,
								onKeyDown: (event, instance) => {if (event.which == 13) this.handleJump(isNaN(parseInt(instance.props.value)) ? -1 : instance.props.value - 1);}
							}),
						].filter(n => n)
					});
				}
				render() {
					let items = [], alphabet = {};
					if (BDFDB.ArrayUtils.is(this.props.items) && this.props.items.length) {
						if (!this.props.alphabetKey) items = this.props.items;
						else {
							let unsortedItems = [].concat(this.props.items);
							for (let key of ["0-9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]) {
								let numbers = key == "0-9", alphaItems = [];
								for (let item of unsortedItems) if (item && item[this.props.alphabetKey] && (numbers && !isNaN(parseInt(item[this.props.alphabetKey][0])) || item[this.props.alphabetKey].toUpperCase().indexOf(key) == 0)) alphaItems.push(item);
								for (let sortedItem of alphaItems) BDFDB.ArrayUtils.remove(unsortedItems, sortedItem);
								alphabet[key] = {items: BDFDB.ArrayUtils.keySort(alphaItems, this.props.alphabetKey), disabled: !alphaItems.length};
							}
							alphabet["?!"] = {items: BDFDB.ArrayUtils.keySort(unsortedItems, this.props.alphabetKey), disabled: !unsortedItems.length};
							for (let key in alphabet) items.push(alphabet[key].items);
							items = items.flat(10);
						}
					}
					return typeof this.props.renderItem != "function" || !items.length ? null : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Scrollers.Thin, {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.paginationlist, this.props.mini && BDFDB.disCN.paginationlistmini),
						fade: this.props.fade,
						children: [
							this.renderPagination(),
							items.length > this.props.amount && this.props.alphabetKey && BDFDB.ReactUtils.createElement("nav", {
								className: BDFDB.disCN.paginationlistalphabet,
								children: Object.keys(alphabet).map(key => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.paginationlistalphabetchar, alphabet[key].disabled &&BDFDB.disCN.paginationlistalphabetchardisabled),
									onClick: _ => {if (!alphabet[key].disabled) this.handleJump(Math.floor(items.indexOf(alphabet[key].items[0])/this.props.amount));},
									children: key
								}))
							}),
							this.props.header,
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.paginationlistcontent,
								children: items.slice(this.state.offset * this.props.amount, (this.state.offset + 1) * this.props.amount).map((data, i) => {return this.props.renderItem(data, i);}).flat(10).filter(n => n)
							}),
							this.props.copyToBottom && this.renderPagination(true)
						].flat(10).filter(n => n)
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.PaginatedList, {amount: 50, offset: 0, mini: true, jump: true, maxVisiblePages: 7, copyToBottom: false, fade: true});
			
			CustomComponents.Popout = reactInitialized && class BDFDB_Popout extends Internal.LibraryModules.React.Component {
				componentDidMount() {
					this.props.containerInstance.popout = this;
					if (typeof this.props.onOpen == "function") this.props.onOpen(this.props.containerInstance, this);
				}
				componentWillUnmount() {
					delete this.props.containerInstance.popout;
					if (typeof this.props.onClose == "function") this.props.onClose(this.props.containerInstance, this);
				}
				render() {
					if (!this.props.wrap) return this.props.children;
					let pos = typeof this.props.position == "string" ? this.props.position.toLowerCase() : null;
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutFocusLock, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.popoutwrapper, this.props.className, this.props.themed && BDFDB.disCN.popoutthemedpopout, this.props.arrow  && BDFDB.disCN.popoutarrow, this.props.arrow && (pos == "top" ? BDFDB.disCN.popoutarrowtop : BDFDB.disCN.popoutarrowbottom)),
						id: this.props.id,
						onClick: e => e.stopPropagation(),
						style: BDFDB.ObjectUtils.extract(this.props, "padding", "height", "maxHeight", "minHeight", "width", "maxWidth", "minWidth"),
						children: this.props.children
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.Popout, {themed: true, wrap: true});
			
			CustomComponents.PopoutContainer = reactInitialized && class BDFDB_PopoutContainer extends Internal.LibraryModules.React.Component {
				componentDidMount() {
					this.toggle = this.toggle.bind(this);
					this.onDocumentClicked = this.onDocumentClicked.bind(this);
					this.domElementRef = BDFDB.ReactUtils.createRef();
					this.domElementRef.current = BDFDB.ReactUtils.findDOMNode(this);
				}
				onDocumentClicked() {
					const node = BDFDB.ReactUtils.findDOMNode(this.popout);
					if (!node || !document.contains(node) || node != event.target && document.contains(event.target) && !node.contains(event.target)) this.toggle();
				}
				toggle() {
					this.props.open = !this.props.open;
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					const child = (BDFDB.ArrayUtils.is(this.props.children) ? this.props.children[0] : this.props.children) || BDFDB.ReactUtils.createElement("div", {style: {height: "100%", width: "100%"}});
					child.props.className = BDFDB.DOMUtils.formatClassName(child.props.className, this.props.className);
					const childProps = Object.assign({}, child.props);
					child.props.onClick = (e, childThis) => {
						if ((this.props.openOnClick || this.props.openOnClick === undefined)) this.toggle();
						if (typeof this.props.onClick == "function") this.props.onClick(e, this);
						if (typeof childProps.onClick == "function") childProps.onClick(e, childThis);
						if (this.props.killEvent || childProps.killEvent) BDFDB.ListenerUtils.stopEvent(e);
					};
					child.props.onContextMenu = (e, childThis) => {
						if (this.props.openOnContextMenu) this.toggle();
						if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
						if (typeof childProps.onContextMenu == "function") childProps.onContextMenu(e, childThis);
						if (this.props.killEvent || childProps.killEvent) BDFDB.ListenerUtils.stopEvent(e);
					};
					return BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
						onClick: this.toggle,
						children: [
							child,
							this.props.open && BDFDB.ReactUtils.createElement(Internal.LibraryComponents.AppReferencePositionLayer, {
								onMount: _ => BDFDB.TimeUtils.timeout(_ => document.addEventListener("click", this.onDocumentClicked)),
								onUnmount: _ => document.removeEventListener("click", this.onDocumentClicked),
								position: this.props.position,
								align: this.props.align,
								reference: this.domElementRef,
								children: _ => {
									const popout = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Popout, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
										className: this.props.popoutClassName,
										containerInstance: this,
										position: this.props.position,
										style: this.props.popoutStyle,
										onOpen: typeof this.props.onOpen == "function" ? this.props.onOpen.bind(this) : _ => {},
										onClose: typeof this.props.onClose == "function" ? this.props.onClose.bind(this) : _ => {},
										children: typeof this.props.renderPopout == "function" ? this.props.renderPopout(this) : null
									}), "popoutStyle", "popoutClassName", "shouldShow", "changing", "renderPopout", "openOnClick", "onClick", "openOnContextMenu", "onContextMenu"));
									const animation = Object.entries(Internal.LibraryComponents.PopoutContainer.Animation).find(n => n[1] == this.props.animation);
									return !animation || this.props.animation == Internal.LibraryComponents.PopoutContainer.Animation.NONE ? popout : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutCSSAnimator, {
										position: this.props.position,
										type: Internal.LibraryComponents.PopoutCSSAnimator.Types[animation[0]],
										children: popout
									});
								}
							})
						]
					});
				}
			};
			Internal.setDefaultProps(CustomComponents.PopoutContainer, {wrap: true});
			
			CustomComponents.QuickSelect = reactInitialized && class BDFDB_QuickSelect extends Internal.LibraryModules.React.Component {
				handleChange(option) {
					this.props.value = option;
					if (typeof this.props.onChange == "function") this.props.onChange(option.value || option.key, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					let options = (BDFDB.ArrayUtils.is(this.props.options) ? this.props.options : [{}]).filter(n => n);
					let selectedOption = BDFDB.ObjectUtils.is(this.props.value) ? this.props.value : (options[0] || {});
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.quickselectwrapper),
						children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
							className: BDFDB.disCN.quickselect,
							align: Internal.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.quickselectlabel,
									children: this.props.label
								}),
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
									align: Internal.LibraryComponents.Flex.Align.CENTER,
									className: BDFDB.disCN.quickselectclick,
									onClick: event => {
										Internal.LibraryModules.ContextMenuUtils.openContextMenu(event, _ => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Menu, {
											navId: "bdfdb-quickselect",
											onClose: Internal.LibraryModules.ContextMenuUtils.closeContextMenu,
											className: this.props.popoutClassName,
											children: BDFDB.ContextMenuUtils.createItem(Internal.LibraryComponents.MenuItems.MenuGroup, {
												children: options.map((option, i) => {
													let selected = option.value && option.value === selectedOption.value || option.key && option.key === selectedOption.key;
													return BDFDB.ContextMenuUtils.createItem(Internal.LibraryComponents.MenuItems.MenuItem, {
														label: option.label,
														id: BDFDB.ContextMenuUtils.createItemId("option", option.key || option.value || i),
														action: selected ? null : event2 => this.handleChange.bind(this)(option)
													});
												})
											})
										}));
									},
									children: [
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.quickselectvalue,
											children: typeof this.props.renderValue == "function" ? this.props.renderValue(this.props.value) : this.props.value.label
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.quickselectarrow
										})
									]
								})
							]
						})
					});
				}
			};
			
			CustomComponents.RadioGroup = reactInitialized && class BDFDB_RadioGroup extends Internal.LibraryModules.React.Component {
				handleChange(value) {
					this.props.value = value.value;
					if (typeof this.props.onChange == "function") this.props.onChange(value, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.RadioGroup, Object.assign({}, this.props, {
						onChange: this.handleChange.bind(this)
					}));
				}
			};
			
			CustomComponents.SearchBar = reactInitialized && class BDFDB_SearchBar extends Internal.LibraryModules.React.Component {
				handleChange(query) {
					this.props.query = query;
					if (typeof this.props.onChange == "function") this.props.onChange(query, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				handleClear() {
					this.props.query = "";
					if (this.props.changeOnClear && typeof this.props.onChange == "function") this.props.onChange("", this);
					if (typeof this.props.onClear == "function") this.props.onClear(this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					let props = Object.assign({}, this.props, {
						onChange: this.handleChange.bind(this),
						onClear: this.handleClear.bind(this)
					});
					if (typeof props.query != "string") props.query = "";
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.SearchBar, props);
				}
			};
			
			CustomComponents.Select = reactInitialized && class BDFDB_Select extends Internal.LibraryModules.React.Component {
				handleChange(value) {
					this.props.value = value.value || value;
					if (typeof this.props.onChange == "function") this.props.onChange(value, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.selectwrapper),
						children: BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.SearchableSelect, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
							className: this.props.inputClassName,
							autoFocus: this.props.autoFocus ? this.props.autoFocus : false,
							maxVisibleItems: this.props.maxVisibleItems || 7,
							renderOptionLabel: this.props.optionRenderer,
							onChange: this.handleChange.bind(this)
						}), "inputClassName", "optionRenderer"))
					});
				}
			};
			
			CustomComponents.SettingsGuildList = reactInitialized && class BDFDB_SettingsGuildList extends Internal.LibraryModules.React.Component {
				render() {
					this.props.disabled = BDFDB.ArrayUtils.is(this.props.disabled) ? this.props.disabled : [];
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
						className: this.props.className,
						wrap: Internal.LibraryComponents.Flex.Wrap.WRAP,
						children: [this.props.includeDMs && {name: BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES, acronym: "DMs", id: BDFDB.DiscordConstants.ME, getIconURL: _ => {}}].concat(Internal.LibraryModules.FolderStore.getFlattenedGuilds()).filter(n => n).map(guild => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
							text: guild.name,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(this.props.guildClassName, BDFDB.disCN.settingsguild, this.props.disabled.includes(guild.id) && BDFDB.disCN.settingsguilddisabled),
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.GuildComponents.Icon, {
									guild: guild,
									size: this.props.size || Internal.LibraryComponents.GuildComponents.Icon.Sizes.MEDIUM
								}),
								onClick: e => {
									let isDisabled = this.props.disabled.includes(guild.id);
									if (isDisabled) BDFDB.ArrayUtils.remove(this.props.disabled, guild.id, true);
									else this.props.disabled.push(guild.id);
									if (typeof this.props.onClick == "function") this.props.onClick(this.props.disabled, this);
									BDFDB.ReactUtils.forceUpdate(this);
								}
							})
						}))
					});
				}
			};
			
			CustomComponents.SettingsPanel = reactInitialized && class BDFDB_SettingsPanel extends Internal.LibraryModules.React.Component {
				componentDidMount() {
					this.props._instance = this;
					let node = BDFDB.ReactUtils.findDOMNode(this);
					if (node) this.props._node = node;
				}
				componentWillUnmount() {
					if (BDFDB.ObjectUtils.is(this.props.addon) && typeof this.props.addon.onSettingsClosed == "function") this.props.addon.onSettingsClosed();
				}
				render() {						
					let panelItems = [
						BDFDB.ReactUtils.createElement(Internal.LibraryComponents.AutoFocusCatcher, {}),
						typeof this.props.children == "function" ? (_ => {
							return this.props.children(this.props.collapseStates);
						})() : this.props.children
					].flat(10).filter(n => n);
					
					return BDFDB.ReactUtils.createElement("div", {
						key: this.props.addon && this.props.addon.name && `${this.props.addon.name}-settingsPanel`,
						id: this.props.addon && this.props.addon.name && `${this.props.addon.name}-settings`,
						className: BDFDB.disCN.settingspanel,
						children: panelItems
					});
				}
			};
			
			CustomComponents.SettingsPanelList = reactInitialized && class BDFDB_SettingsPanelInner extends Internal.LibraryModules.React.Component {
				render() {
					return this.props.children ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.settingspanellistwrapper, this.props.mini && BDFDB.disCN.settingspanellistwrappermini),
						children: [
							this.props.dividerTop ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormDivider, {
								className: this.props.mini ? BDFDB.disCN.marginbottom4 : BDFDB.disCN.marginbottom8
							}) : null,
							typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormTitle, {
								className: BDFDB.disCN.marginbottom4,
								tag: Internal.LibraryComponents.FormComponents.FormTitle.Tags.H3,
								children: this.props.title
							}) : null,
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.settingspanellist,
								children: this.props.children
							}),
							this.props.dividerBottom ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormDivider, {
								className: this.props.mini ? BDFDB.disCN.margintop4 : BDFDB.disCN.margintop8
							}) : null
						]
					}) : null;
				}
			};
			
			CustomComponents.SettingsItem = reactInitialized && class BDFDB_SettingsItem extends Internal.LibraryModules.React.Component {
				handleChange(value) {
					if (typeof this.props.onChange == "function") this.props.onChange(value, this);
				}
				render() {
					if (typeof this.props.type != "string" || !["BUTTON", "SELECT", "SLIDER", "SWITCH", "TEXTINPUT"].includes(this.props.type.toUpperCase())) return null;
					let childComponent = Internal.LibraryComponents[this.props.type];
					if (!childComponent) return null;
					if (this.props.mini && childComponent.Sizes) this.props.size = childComponent.Sizes.MINI || childComponent.Sizes.MIN;
					let label = this.props.label ? (this.props.tag ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.DOMUtils.formatClassName(this.props.labelClassName, BDFDB.disCN.marginreset),
						tag: this.props.tag,
						children: this.props.label
					}) : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsLabel, {
						className: BDFDB.DOMUtils.formatClassName(this.props.labelClassName),
						mini: this.props.mini,
						label: this.props.label
					})) : null;
					let margin = this.props.margin != null ? this.props.margin : (this.props.mini ? 0 : 8);
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.settingsrow, BDFDB.disCN.settingsrowcontainer, this.props.disabled && BDFDB.disCN.settingsrowdisabled, margin != null && (DiscordClasses[`marginbottom${margin}`] && BDFDB.disCN[`marginbottom${margin}`] || margin == 0 && BDFDB.disCN.marginreset)),
						id: this.props.id,
						children: [
							this.props.dividerTop ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormDivider, {
								className: this.props.mini ? BDFDB.disCN.marginbottom4 : BDFDB.disCN.marginbottom8
							}) : null,
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.settingsrowlabel,
								children: [
									label && !this.props.basis ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
										grow: 1,
										shrink: 1,
										wrap: true,
										children: label
									}) : label,
									this.props.labelChildren,
									BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
										className: BDFDB.disCNS.settingsrowcontrol + BDFDB.disCN.flexchild,
										grow: 0,
										shrink: this.props.basis ? 0 : 1,
										basis: this.props.basis,
										wrap: true,
										children: BDFDB.ReactUtils.createElement(childComponent, BDFDB.ObjectUtils.exclude(Object.assign(BDFDB.ObjectUtils.exclude(this.props, "className", "id", "type"), this.props.childProps, {
											onChange: this.handleChange.bind(this),
											onValueChange: this.handleChange.bind(this)
										}), "basis", "margin", "dividerBottom", "dividerTop", "label", "labelClassName", "labelChildren", "tag", "mini", "note", "childProps"))
									})
								].flat(10).filter(n => n)
							}),
							typeof this.props.note == "string" ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
								className: BDFDB.disCN.settingsrownote,
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormText, {
									disabled: this.props.disabled,
									type: Internal.LibraryComponents.FormComponents.FormText.Types.DESCRIPTION,
									children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextScroller, {speed: 2, children: this.props.note})
								})
							}) : null,
							this.props.dividerBottom ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FormComponents.FormDivider, {
								className: this.props.mini ? BDFDB.disCN.margintop4 : BDFDB.disCN.margintop8
							}) : null
						]
					});
				}
			};
			
			CustomComponents.SettingsLabel = reactInitialized && class BDFDB_SettingsLabel extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextScroller, {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.settingsrowtitle, this.props.mini ? BDFDB.disCN.settingsrowtitlemini : BDFDB.disCN.settingsrowtitledefault, BDFDB.disCN.cursordefault),
						speed: 2,
						children: this.props.label
					});
				}	
			};
			
			CustomComponents.SettingsList = reactInitialized && class BDFDB_SettingsList extends Internal.LibraryModules.React.Component {
				componentDidMount() {
					this.checkList();
				}
				componentDidUpdate() {
					this.checkList();
				}
				checkList() {
					let list = BDFDB.ReactUtils.findDOMNode(this);
					if (list && !this.props.configWidth) {
						let headers = Array.from(list.querySelectorAll(BDFDB.dotCN.settingstableheader));
						headers.shift();
						if (BDFDB.DOMUtils.getRects(headers[0]).width == 0) BDFDB.TimeUtils.timeout(_ => {this.resizeList(headers);});
						else this.resizeList(headers);
					}
				}
				resizeList(headers) {
					let configWidth = 0, biggestWidth = 0;
					if (!configWidth) {
						for (let header of headers) {
							header.style = "";
							let width = BDFDB.DOMUtils.getRects(header).width;
							configWidth = width > configWidth ? width : configWidth;
						}
						configWidth += 4;
						biggestWidth = configWidth;
					}
					if (headers.length * configWidth > 300) {
						this.props.vertical = true;
						configWidth = parseInt(290 / headers.length);
					}
					else if (configWidth < 36) {
						configWidth = 36;
						biggestWidth = configWidth;
					}
					this.props.configWidth = configWidth;
					this.props.biggestWidth = biggestWidth;
					BDFDB.ReactUtils.forceUpdate(this);
				}
				renderHeaderOption(props) {
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(props.className, BDFDB.disCN.colorbase, BDFDB.disCN.size10, props.clickable && BDFDB.disCN.cursorpointer),
						onClick: _ => {if (typeof this.props.onHeaderClick == "function") this.props.onHeaderClick(props.label, this);},
						onContextMenu: _ => {if (typeof this.props.onHeaderContextMenu == "function") this.props.onHeaderContextMenu(props.label, this);},
						children: BDFDB.ReactUtils.createElement("span", {
							children: props.label
						})
					});
				}
				renderItem(props) {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Card, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName([this.props.cardClassName, props.className].filter(n => n).join(" ").indexOf(BDFDB.disCN.card) == -1 && BDFDB.disCN.cardprimaryoutline, BDFDB.disCN.settingstablecard, this.props.cardClassName, props.className),
						cardId: props.key,
						backdrop: false,
						horizontal: true,
						style: Object.assign({}, this.props.cardStyle, props.style),
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.settingstablecardlabel,
								children: this.props.renderLabel(props, this)
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.settingstablecardconfigs,
								style: {
									width: props.wrapperWidth || null,
									minWidth: props.wrapperWidth || null,
									maxWidth: props.wrapperWidth || null
								},
								children: this.props.settings.map(setting => BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.checkboxcontainer,
									children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
										text: setting,
										children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Checkbox, {
											disabled: props.disabled,
											cardId: props.key,
											settingId: setting,
											shape: Internal.LibraryComponents.Checkbox.Shapes && Internal.LibraryComponents.Checkbox.Shapes.ROUND,
											type: Internal.LibraryComponents.Checkbox.Types && Internal.LibraryComponents.Checkbox.Types.INVERTED,
											color: this.props.checkboxColor,
											getColor: this.props.getCheckboxColor,
											value: props[setting],
											getValue: this.props.getCheckboxValue,
											onChange: this.props.onCheckboxChange
										})
									})
								})).flat(10).filter(n => n)
							})
						]
					}), "title", "data", "settings", "renderLabel", "cardClassName", "cardStyle", "checkboxColor", "getCheckboxColor",  "getCheckboxValue", "onCheckboxChange", "configWidth", "biggestWidth", "pagination"));
				}
				render() {
					this.props.settings = BDFDB.ArrayUtils.is(this.props.settings) ? this.props.settings : [];
					this.props.renderLabel = typeof this.props.renderLabel == "function" ? this.props.renderLabel : data => data.label;
					this.props.data = (BDFDB.ArrayUtils.is(this.props.data) ? this.props.data : [{}]).filter(n => n);
					
					let wrapperWidth = this.props.configWidth && this.props.configWidth * this.props.settings.length;
					let isHeaderClickable = typeof this.props.onHeaderClick == "function" || typeof this.props.onHeaderContextMenu == "function";
					let usePagination = BDFDB.ObjectUtils.is(this.props.pagination);
					
					let header = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.settingstableheaders,
						style: this.props.vertical && this.props.biggestWidth ? {
							marginTop: this.props.biggestWidth - 15 || 0
						} : {},
						children: [
							this.renderHeaderOption({
								className: BDFDB.disCN.settingstableheadername,
								clickable: this.props.title && isHeaderClickable,
								label: this.props.title || ""
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.settingstableheaderoptions,
								style: {
									width: wrapperWidth || null,
									minWidth: wrapperWidth || null,
									maxWidth: wrapperWidth || null
								},
								children: this.props.settings.map(setting => this.renderHeaderOption({
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.settingstableheaderoption, this.props.vertical && BDFDB.disCN.settingstableheadervertical),
									clickable: isHeaderClickable,
									label: setting
								}))
							})
						]
					});
					return !this.props.data.length ? null : BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.settingstablelist, this.props.className),
						children: [
							!usePagination && header,
							!usePagination ? this.props.data.map(data => this.renderItem(Object.assign({}, data, {wrapperWidth}))) : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PaginatedList, Object.assign({}, this.props.pagination, {
								header: header,
								items: this.props.data,
								renderItem: data => this.renderItem(Object.assign({}, data, {wrapperWidth})),
								onJump: (offset, instance) => {
									this.props.pagination.offset = offset;
									if (typeof this.props.pagination.onJump == "function") this.props.pagination.onJump(offset, this, instance);
								}
							}))
						].filter(n => n)
					});
				}
			};
			
			CustomComponents.SettingsSaveItem = reactInitialized && class BDFDB_SettingsSaveItem extends Internal.LibraryModules.React.Component {
				saveSettings(value) {
					if (!BDFDB.ArrayUtils.is(this.props.keys) || !BDFDB.ObjectUtils.is(this.props.plugin)) return;
					let keys = this.props.keys.filter(n => n);
					let option = keys.shift();
					if (BDFDB.ObjectUtils.is(this.props.plugin) && option) {
						let data = BDFDB.DataUtils.load(this.props.plugin, option);
						let newC = "";
						for (let key of keys) newC += `{"${key}":`;
						value = value != null && value.value != null ? value.value : value;
						let isString = typeof value == "string";
						let marker = isString ? `"` : ``;
						newC += (marker + (isString ? value.replace(/\\/g, "\\\\") : value) + marker) + "}".repeat(keys.length);
						newC = JSON.parse(newC);
						newC = BDFDB.ObjectUtils.is(newC) ? BDFDB.ObjectUtils.deepAssign({}, data, newC) : newC;
						BDFDB.DataUtils.save(newC, this.props.plugin, option);
						if (!this.props.plugin.settings) this.props.plugin.settings = {};
						this.props.plugin.settings[option] = newC;
						this.props.plugin.SettingsUpdated = true;
					}
					if (typeof this.props.onChange == "function") this.props.onChange(value, this);
				}
				render() {
					if (typeof this.props.type != "string" || !["SELECT", "SLIDER", "SWITCH", "TEXTINPUT"].includes(this.props.type.toUpperCase())) return null;
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsItem, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						onChange: this.saveSettings.bind(this)
					}), "keys", "key", "plugin"));
				}
			};
			
			CustomComponents.SidebarList = reactInitialized && class BDFDB_SidebarList extends Internal.LibraryModules.React.Component {
				handleItemSelect(item) {
					this.props.selectedItem = item;
					if (typeof this.props.onItemSelect == "function") this.props.onItemSelect(item, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					let items = (BDFDB.ArrayUtils.is(this.props.items) ? this.props.items : [{}]).filter(n => n);
					let selectedItem = this.props.selectedItem || (items[0] || {}).value;
					let selectedElements = (items.find(n => n.value == selectedItem) || {}).elements;
					let renderElement = typeof this.props.renderElement == "function" ? this.props.renderElement : (_ => {});
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.sidebarlist),
						children: [
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Scrollers.Thin, {
								className: BDFDB.DOMUtils.formatClassName(this.props.sidebarClassName, BDFDB.disCN.sidebar),
								fade: true,
								children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TabBar, {
									itemClassName: this.props.itemClassName,
									type: Internal.LibraryComponents.TabBar.Types.SIDE,
									items: items,
									selectedItem: selectedItem,
									renderItem: this.props.renderItem,
									onItemSelect: this.handleItemSelect.bind(this)
								})
							}),
							BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Scrollers.Thin, {
								className: BDFDB.DOMUtils.formatClassName(this.props.contentClassName, BDFDB.disCN.sidebarcontent),
								fade: true,
								children: [selectedElements].flat(10).filter(n => n).map(data => renderElement(data))
							})
						]
					});
				}
			};
			
			CustomComponents.Slider = reactInitialized && class BDFDB_Slider extends Internal.LibraryModules.React.Component {
				handleMarkerRender(marker) {
					let newMarker = BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, marker);
					if (typeof this.props.digits == "number") newMarker = Math.round(newMarker * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
					return newMarker;
				}
				handleValueChange(value) {
					let newValue = BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, value);
					if (typeof this.props.digits == "number") newValue = Math.round(newValue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
					this.props.defaultValue = this.props.value = newValue;
					if (typeof this.props.onValueChange == "function") this.props.onValueChange(newValue, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				handleValueRender(value) {
					let newValue = BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, value);
					if (typeof this.props.digits == "number") newValue = Math.round(newValue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
					if (typeof this.props.onValueRender == "function") {
						let tempReturn = this.props.onValueRender(newValue, this);
						if (tempReturn != undefined) newValue = tempReturn;
					}
					return newValue;
				}
				render() {
					let value = this.props.value || this.props.defaultValue || 0;
					if (!BDFDB.ArrayUtils.is(this.props.edges) || this.props.edges.length != 2) this.props.edges = [this.props.min || this.props.minValue || 0, this.props.max || this.props.maxValue || 100];
					this.props.minValue = 0;
					this.props.maxValue = 100;
					let defaultValue = BDFDB.NumberUtils.mapRange(this.props.edges, [0, 100], value);
					if (typeof this.props.digits == "number") defaultValue = Math.round(defaultValue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.Slider, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						initialValue: defaultValue,
						markers: typeof this.props.markerAmount == "number" ? Array.from(Array(this.props.markerAmount).keys()).map((_, i) => i * (this.props.maxValue - this.props.minValue)/10) : undefined,
						onMarkerRender: this.handleMarkerRender.bind(this),
						onValueChange: this.handleValueChange.bind(this),
						onValueRender: this.handleValueRender.bind(this)
					}), "digits", "edges", "max", "min", "markerAmount"));
				}
			};
			Internal.setDefaultProps(CustomComponents.Slider, {hideBubble: false, digits: 3});
			
			CustomComponents.SvgIcon = reactInitialized && class BDFDB_Icon extends Internal.LibraryModules.React.Component {
				render() {
					if (BDFDB.ObjectUtils.is(this.props.name)) {
						let calcClassName = [];
						if (BDFDB.ObjectUtils.is(this.props.name.getClassName)) for (let path in this.props.name.getClassName) {
							if (!path || BDFDB.ObjectUtils.get(this, path)) calcClassName.push(BDFDB.disCN[this.props.name.getClassName[path]]);
						}
						if (calcClassName.length || this.props.className) this.props.nativeClass = true;
						this.props.iconSVG = this.props.name.icon;
						let props = Object.assign({
							width: 24,
							height: 24,
							color: "currentColor"
						}, this.props.name.defaultProps, this.props, {
							className: BDFDB.DOMUtils.formatClassName(calcClassName, this.props.className)
						});
						for (let key in props) this.props.iconSVG = this.props.iconSVG.replace(new RegExp(`%%${key}`, "g"), props[key]);
					}
					if (this.props.iconSVG) {
						let icon = BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(this.props.iconSVG));
						if (BDFDB.ReactUtils.isValidElement(icon)) {
							icon.props.className = BDFDB.DOMUtils.formatClassName(!this.props.nativeClass && BDFDB.disCN.svgicon, icon.props.className, this.props.className);
							icon.props.style = Object.assign({}, icon.props.style, this.props.style);
							icon.props = Object.assign({}, BDFDB.ObjectUtils.extract(this.props, "onClick", "onContextMenu", "onMouseDown", "onMouseUp", "onMouseEnter", "onMouseLeave"), icon.props);
							return icon;
						}
					}
					return null;
				}
			};
			CustomComponents.SvgIcon.Names = InternalData.SvgIcons || {};
			
			const SwitchIconPaths = {
				a: {
					TOP: "M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z",
					BOTTOM: "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"
				},
				b: {
					TOP: "M6.56666 11.0013L6.56666 8.96683L13.5667 8.96683L13.5667 11.0013L6.56666 11.0013Z",
					BOTTOM: "M13.5582 8.96683L13.5582 11.0013L6.56192 11.0013L6.56192 8.96683L13.5582 8.96683Z"
				},
				c: {
					TOP: "M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z",
					BOTTOM: "M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"
				}
			};
			const SwitchInner = function (props) {
				let reducedMotion = BDFDB.ReactUtils.useContext(Internal.LibraryModules.PreferencesContext.AccessibilityPreferencesContext).reducedMotion;
				let ref = BDFDB.ReactUtils.useRef(null);
				let state = BDFDB.ReactUtils.useState(false);
				let animation = Internal.LibraryComponents.Animations.useSpring({
					config: {
						mass: 1,
						tension: 250
					},
					opacity: props.disabled ? .3 : 1,
					state: state[0] ? (props.value ? .7 : .3) : (props.value ? 1 : 0)
				});
				let fill = animation.state.to({
					output: [props.uncheckedColor, props.checkedColor]
				});
				let mini = props.size == Internal.LibraryComponents.Switch.Sizes.MINI;
				
				return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.div, {
					className: BDFDB.DOMUtils.formatClassName(props.className, BDFDB.disCN.switch, mini && BDFDB.disCN.switchmini),
					onMouseDown: _ => {
						return !props.disabled && state[1](true);
					},
					onMouseUp: _ => {
						return state[1](false);
					},
					onMouseLeave: _ => {
						return state[1](false);
					},
					style: {
						opacity: animation.opacity,
						backgroundColor: animation.state.to({
							output: [props.uncheckedColor, props.checkedColor]
						})
					},
					tabIndex: -1,
					children: [
						BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.svg, {
							className: BDFDB.disCN.switchslider,
							viewBox: "0 0 28 20",
							preserveAspectRatio: "xMinYMid meet",
							style: {
								left: animation.state.to({
									range: [0, .3, .7, 1],
									output: mini ? [-1, 2, 6, 9] : [-3, 1, 8, 12]
								})
							},
							children: [
								BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.rect, {
									fill: "white",
									x: animation.state.to({
										range: [0, .3, .7, 1],
										output: [4, 0, 0, 4]
									}),
									y: animation.state.to({
										range: [0, .3, .7, 1],
										output: [0, 1, 1, 0]
									}),
									height: animation.state.to({
										range: [0, .3, .7, 1],
										output: [20, 18, 18, 20]
									}),
									width: animation.state.to({
										range: [0, .3, .7, 1],
										output: [20, 28, 28, 20]
									}),
									rx: "10"
								}),
								BDFDB.ReactUtils.createElement("svg", {
									viewBox: "0 0 20 20",
									fill: "none",
									children: [
										BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.path, {
											fill: fill,
											d: animation.state.to({
												range: [0, .3, .7, 1],
												output: reducedMotion.enabled ? [SwitchIconPaths.a.TOP, SwitchIconPaths.a.TOP, SwitchIconPaths.c.TOP, SwitchIconPaths.c.TOP] : [SwitchIconPaths.a.TOP, SwitchIconPaths.b.TOP, SwitchIconPaths.b.TOP, SwitchIconPaths.c.TOP]
											})
										}),
										BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.path, {
											fill: fill,
											d: animation.state.to({
												range: [0, .3, .7, 1],
												output: reducedMotion.enabled ? [SwitchIconPaths.a.BOTTOM, SwitchIconPaths.a.BOTTOM, SwitchIconPaths.c.BOTTOM, SwitchIconPaths.c.BOTTOM] : [SwitchIconPaths.a.BOTTOM, SwitchIconPaths.b.BOTTOM, SwitchIconPaths.b.BOTTOM, SwitchIconPaths.c.BOTTOM]
											})
										})
									]
								})
							]
						}),
						BDFDB.ReactUtils.createElement("input", BDFDB.ObjectUtils.exclude(Object.assign({}, props, {
							id: props.id,
							type: "checkbox",
							ref: ref,
							className: BDFDB.DOMUtils.formatClassName(props.inputClassName, BDFDB.disCN.switchinner),
							tabIndex: props.disabled ? -1 : 0,
							onKeyDown: e => {
								if (!props.disabled && !e.repeat && (e.key == " " || e.key == "Enter")) state[1](true);
							},
							onKeyUp: e => {
								if (!props.disabled && !e.repeat) {
									state[1](false);
									if (e.key == "Enter" && ref.current) ref.current.click();
								}
							},
							onChange: e => {
								state[1](false);
								if (typeof props.onChange == "function") props.onChange(e.currentTarget.checked, e);
							},
							checked: props.value,
							disabled: props.disabled
						}), "uncheckedColor", "checkedColor", "size", "value"))
					]
				});
			};
			CustomComponents.Switch = reactInitialized && class BDFDB_Switch extends Internal.LibraryModules.React.Component {
				handleChange() {
					this.props.value = !this.props.value;
					if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					return BDFDB.ReactUtils.createElement(SwitchInner, Object.assign({}, this.props, {
						onChange: this.handleChange.bind(this)
					}));
				}
			};
			CustomComponents.Switch.Sizes = {
				DEFAULT: "default",
				MINI: "mini",
			};
			Internal.setDefaultProps(CustomComponents.Switch, {
				size: CustomComponents.Switch.Sizes.DEFAULT,
				uncheckedColor: BDFDB.DiscordConstants.Colors.PRIMARY_DARK_400,
				checkedColor: BDFDB.DiscordConstants.Colors.BRAND
			});
			
			CustomComponents.TabBar = reactInitialized && class BDFDB_TabBar extends Internal.LibraryModules.React.Component {
				handleItemSelect(item) {
					this.props.selectedItem = item;
					if (typeof this.props.onItemSelect == "function") this.props.onItemSelect(item, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				render() {
					let items = (BDFDB.ArrayUtils.is(this.props.items) ? this.props.items : [{}]).filter(n => n);
					let selectedItem = this.props.selectedItem || (items[0] || {}).value;
					let renderItem = typeof this.props.renderItem == "function" ? this.props.renderItem : (data => data.label || data.value);
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.TabBar, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						selectedItem: selectedItem,
						onItemSelect: this.handleItemSelect.bind(this),
						children: items.map(data => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TabBar.Item, {
							className: BDFDB.DOMUtils.formatClassName(this.props.itemClassName, selectedItem == data.value && this.props.itemSelectedClassName),
							itemType: this.props.type,
							id: data.value,
							children: renderItem(data),
							"aria-label": data.label || data.value
						}))
					}), "itemClassName", "items", "renderItem"));
				}
			};
			
			CustomComponents.Table = reactInitialized && class BDFDB_Table extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.Table, Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.table, this.props.className),
						headerCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercell, this.props.headerCellClassName),
						sortedHeaderCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercellsorted, this.props.sortedHeaderCellClassName),
						bodyCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tablebodycell, this.props.bodyCellClassName),
						onSort: (sortKey, sortDirection) => {
							this.props.sortDirection = this.props.sortKey != sortKey && sortDirection == Internal.LibraryComponents.Table.SortDirection.ASCENDING && this.props.columns.filter(n => n.key == sortKey)[0].reverse ? Internal.LibraryComponents.Table.SortDirection.DESCENDING : sortDirection;
							this.props.sortKey = sortKey;
							this.props.data = BDFDB.ArrayUtils.keySort(this.props.data, this.props.sortKey);
							if (this.props.sortDirection == Internal.LibraryComponents.Table.SortDirection.DESCENDING) this.props.data.reverse();
							if (typeof this.props.onSort == "function") this.props.onSort(this.props.sortKey, this.props.sortDirection);
							BDFDB.ReactUtils.forceUpdate(this);
						}
					}));
				}
			};
			
			CustomComponents.TextArea = reactInitialized && class BDFDB_TextArea extends Internal.LibraryModules.React.Component {
				handleChange(e) {
					this.props.value = e;
					if (typeof this.props.onChange == "function") this.props.onChange(e, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				handleBlur(e) {if (typeof this.props.onBlur == "function") this.props.onBlur(e, this);}
				handleFocus(e) {if (typeof this.props.onFocus == "function") this.props.onFocus(e, this);}
				render() {
					return BDFDB.ReactUtils.createElement(Internal.NativeSubComponents.TextArea, Object.assign({}, this.props, {
						onChange: this.handleChange.bind(this),
						onBlur: this.handleBlur.bind(this),
						onFocus: this.handleFocus.bind(this)
					}));
				}
			};
			
			CustomComponents.TextGradientElement = reactInitialized && class BDFDB_TextGradientElement extends Internal.LibraryModules.React.Component {
				render() {
					if (this.props.gradient && this.props.children) return BDFDB.ReactUtils.createElement("span", {
						children: this.props.children,
						ref: instance => {
							let ele = BDFDB.ReactUtils.findDOMNode(instance);
							if (ele) {
								ele.style.setProperty("background-image", this.props.gradient, "important");
								ele.style.setProperty("color", "transparent", "important");
								ele.style.setProperty("-webkit-background-clip", "text", "important");
							}
						}
					});
					return this.props.children || null;
				}
			};
			
			CustomComponents.TextInput = reactInitialized && class BDFDB_TextInput extends Internal.LibraryModules.React.Component {
				handleChange(e) {
					let value = e = BDFDB.ObjectUtils.is(e) ? e.currentTarget.value : e;
					this.props.value = this.props.valuePrefix && !value.startsWith(this.props.valuePrefix) ? (this.props.valuePrefix + value) : value;
					if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
					BDFDB.ReactUtils.forceUpdate(this);
				}
				handleInput(e) {if (typeof this.props.onInput == "function") this.props.onInput(BDFDB.ObjectUtils.is(e) ? e.currentTarget.value : e, this);}
				handleKeyDown(e) {if (typeof this.props.onKeyDown == "function") this.props.onKeyDown(e, this);}
				handleBlur(e) {if (typeof this.props.onBlur == "function") this.props.onBlur(e, this);}
				handleFocus(e) {if (typeof this.props.onFocus == "function") this.props.onFocus(e, this);}
				handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
				handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
				handleNumberButton(ins, value) {
					BDFDB.TimeUtils.clear(this.pressedTimeout);
					this.pressedTimeout = BDFDB.TimeUtils.timeout(_ => {
						delete this.props.focused;
						BDFDB.ReactUtils.forceUpdate(this);
					}, 1000);
					this.props.focused = true;
					this.handleChange.apply(this, [value]);
					this.handleInput.apply(this, [value]);
				}
				componentDidMount() {
					if (this.props.type == "file") {
						let navigatorInstance = BDFDB.ReactUtils.findOwner(this, {name: "BDFDB_FileButton"});
						if (navigatorInstance) navigatorInstance.refInput = this;
					}
					let input = BDFDB.ReactUtils.findDOMNode(this);
					if (!input) return;
					input = input.querySelector("input") || input;
					if (input && !input.patched) {
						input.addEventListener("keydown", e => {
							this.handleKeyDown.apply(this, [e]);
							e.stopImmediatePropagation();
						});
						input.patched = true;
					}
				}
				render() {
					let inputChildren = [
						BDFDB.ReactUtils.createElement("input", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
							className: BDFDB.DOMUtils.formatClassName(this.props.size && Internal.LibraryComponents.TextInput.Sizes[this.props.size.toUpperCase()] && BDFDB.disCN["input" + this.props.size.toLowerCase()] || BDFDB.disCN.inputdefault, this.props.inputClassName, this.props.focused && BDFDB.disCN.inputfocused, this.props.error || this.props.errorMessage ? BDFDB.disCN.inputerror : (this.props.success && BDFDB.disCN.inputsuccess), this.props.disabled && BDFDB.disCN.inputdisabled, this.props.editable && BDFDB.disCN.inputeditable),
							type: this.props.type == "color" || this.props.type == "file" ? "text" : this.props.type,
							onChange: this.handleChange.bind(this),
							onInput: this.handleInput.bind(this),
							onKeyDown: this.handleKeyDown.bind(this),
							onBlur: this.handleBlur.bind(this),
							onFocus: this.handleFocus.bind(this),
							onMouseEnter: this.handleMouseEnter.bind(this),
							onMouseLeave: this.handleMouseLeave.bind(this),
							maxLength: this.props.type == "file" ? false : this.props.maxLength,
							style: this.props.width ? {width: `${this.props.width}px`} : {},
							ref: this.props.inputRef
						}), "errorMessage", "focused", "error", "success", "inputClassName", "inputChildren", "valuePrefix", "inputPrefix", "size", "editable", "inputRef", "style", "mode", "colorPickerOpen", "noAlpha", "filter", "useFilePath", "searchFolders")),
						this.props.inputChildren,
						this.props.type == "color" ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
							wrap: true,
							children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.ColorSwatches, {
								colors: [],
								color: this.props.value && this.props.mode == "comp" ? BDFDB.ColorUtils.convert(this.props.value.split(","), "RGB") : this.props.value,
								onColorChange: color => this.handleChange.apply(this, [!color ? "" : (this.props.mode == "comp" ? BDFDB.ColorUtils.convert(color, "RGBCOMP").slice(0, 3).join(",") : BDFDB.ColorUtils.convert(color, this.props.noAlpha ? "RGB" : "RGBA"))]),
								pickerOpen: this.props.colorPickerOpen,
								onPickerOpen: _ => this.props.colorPickerOpen = true,
								onPickerClose: _ => delete this.props.colorPickerOpen,
								ref: this.props.controlsRef,
								pickerConfig: {gradient: false, alpha: this.props.mode != "comp" && !this.props.noAlpha}
							})
						}) : null,
						this.props.type == "file" ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.FileButton, {
							filter: this.props.filter,
							mode: this.props.mode,
							useFilePath: this.props.useFilePath,
							searchFolders: this.props.searchFolders,
							ref: this.props.controlsRef
						}) : null
					].flat(10).filter(n => n);
					
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.inputwrapper, this.props.type == "number" && (this.props.size && Internal.LibraryComponents.TextInput.Sizes[this.props.size.toUpperCase()] && BDFDB.disCN["inputnumberwrapper" + this.props.size.toLowerCase()] || BDFDB.disCN.inputnumberwrapperdefault), this.props.className),
						style: this.props.style,
						children: [
							this.props.inputPrefix ? BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN.inputprefix
							}) : null,
							this.props.type == "number" ? BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.inputnumberbuttons,
								children: [
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.inputnumberbuttonup,
										onClick: e => {
											let min = parseInt(this.props.min);
											let max = parseInt(this.props.max);
											let newV = parseInt(this.props.value) + 1 || min || 0;
											if (isNaN(max) || !isNaN(max) && newV <= max) this.handleNumberButton.bind(this)(e._targetInst, isNaN(min) || !isNaN(min) && newV >= min ? newV : min);
										}
									}),
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.inputnumberbuttondown,
										onClick: e => {
											let min = parseInt(this.props.min);
											let max = parseInt(this.props.max);
											let newV = parseInt(this.props.value) - 1 || min || 0;
											if (isNaN(min) || !isNaN(min) && newV >= min) this.handleNumberButton.bind(this)(e._targetInst, isNaN(max) || !isNaN(max) && newV <= max ? newV : max);
										}
									})
								]
							}) : null,
							inputChildren.length == 1 ? inputChildren[0] : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex, {
								align: Internal.LibraryComponents.Flex.Align.CENTER,
								children: inputChildren.map((child, i) => i != 0 ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Flex.Child, {
									shrink: 0,
									children: child
								}) : child)
							}),
							this.props.errorMessage ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TextElement, {
								className: BDFDB.disCN.margintop8,
								size: Internal.LibraryComponents.TextElement.Sizes.SIZE_12,
								color: Internal.LibraryComponents.TextElement.Colors.STATUS_RED,
								children: this.props.errorMessage
							}) : null
						].filter(n => n)
					});
				}
			};
			
			CustomComponents.TextScroller = reactInitialized && class BDFDB_TextScroller extends Internal.LibraryModules.React.Component {
				render() {
					let scrolling, scroll = _ => {};
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textscroller, this.props.className),
						style: Object.assign({}, this.props.style, {
							position: "relative",
							display: "block",
							overflow: "hidden"
						}),
						ref: instance => {
							const ele = BDFDB.ReactUtils.findDOMNode(instance);
							if (ele && ele.parentElement) {
								const maxWidth = BDFDB.DOMUtils.getInnerWidth(ele.parentElement);
								if (maxWidth > 50) ele.style.setProperty("max-width", `${maxWidth}px`);
								if (!this.props.initiated) BDFDB.TimeUtils.timeout(_ => {
									this.props.initiated = true;
									if (document.contains(ele.parentElement)) BDFDB.ReactUtils.forceUpdate(this);
								}, 3000);
								const Animation = new Internal.LibraryModules.AnimationUtils.Value(0);
								Animation.interpolate({inputRange: [0, 1], outputRange: [0, (BDFDB.DOMUtils.getRects(ele.firstElementChild).width - BDFDB.DOMUtils.getRects(ele).width) * -1]}).addListener(v => {
									ele.firstElementChild.style.setProperty("display", v.value == 0 ? "inline" : "block", "important");
									ele.firstElementChild.style.setProperty("left", `${v.value}px`, "important");
								});
								scroll = p => {
									const display = ele.firstElementChild.style.getPropertyValue("display");
									ele.firstElementChild.style.setProperty("display", "inline", "important");
									const innerWidth = BDFDB.DOMUtils.getRects(ele.firstElementChild).width;
									const outerWidth = BDFDB.DOMUtils.getRects(ele).width;
									ele.firstElementChild.style.setProperty("display", display, "important");
									
									let w = p + parseFloat(ele.firstElementChild.style.getPropertyValue("left")) / (innerWidth - outerWidth);
									w = isNaN(w) || !isFinite(w) ? p : w;
									w *= innerWidth / (outerWidth * 2);
									Internal.LibraryModules.AnimationUtils.parallel([Internal.LibraryModules.AnimationUtils.timing(Animation, {toValue: p, duration: Math.sqrt(w**2) * 4000 / (parseInt(this.props.speed) || 1)})]).start();
								};
							}
						},
						onClick: e => {
							if (typeof this.props.onClick == "function") this.props.onClick(e, this);
						},
						onMouseEnter: e => {
							if (BDFDB.DOMUtils.getRects(e.currentTarget).width < BDFDB.DOMUtils.getRects(e.currentTarget.firstElementChild).width || e.currentTarget.firstElementChild.style.getPropertyValue("display") != "inline") {
								scrolling = true;
								scroll(1);
							}
						},
						onMouseLeave: e => {
							if (scrolling) {
								scrolling = false;
								scroll(0);
							}
						},
						children: BDFDB.ReactUtils.createElement("div", {
							style: {
								left: "0",
								position: "relative",
								display: "inline",
								whiteSpace: "nowrap"
							},
							children: this.props.children
						})
					});
				}
			};
			CustomComponents.TooltipContainer = reactInitialized && class BDFDB_TooltipContainer extends Internal.LibraryModules.React.Component {
				updateTooltip(text) {
					if (this.tooltip) this.tooltip.update(text);
				}
				render() {
					let child = (typeof this.props.children == "function" ? this.props.children() : (BDFDB.ArrayUtils.is(this.props.children) ? this.props.children[0] : this.props.children)) || BDFDB.ReactUtils.createElement("div", {});
					child.props.className = BDFDB.DOMUtils.formatClassName(child.props.className, this.props.className);
					let childProps = Object.assign({}, child.props);
					let shown = false;
					child.props.onMouseEnter = (e, childThis) => {
						if (!shown && !e.currentTarget.__BDFDBtooltipShown && !(this.props.onlyShowOnShift && !e.shiftKey) && !(this.props.onlyShowOnCtrl && !e.ctrlKey)) {
							e.currentTarget.__BDFDBtooltipShown = shown = true;
							this.tooltip = BDFDB.TooltipUtils.create(e.currentTarget, typeof this.props.text == "function" ? this.props.text(this, e) : this.props.text, Object.assign({
								note: this.props.note,
								delay: this.props.delay
							}, this.props.tooltipConfig, {
								onHide: (tooltip, anker) => {
									delete anker.__BDFDBtooltipShown;
									shown = false;
									if (this.props.tooltipConfig && typeof this.props.tooltipConfig.onHide == "function") this.props.tooltipConfig.onHide(tooltip, anker);
								}
							}));
							if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);
							if (typeof childProps.onMouseEnter == "function") childProps.onMouseEnter(e, childThis);
						}
					};
					child.props.onMouseLeave = (e, childThis) => {
						if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);
						if (typeof childProps.onMouseLeave == "function") childProps.onMouseLeave(e, childThis);
					};
					child.props.onClick = (e, childThis) => {
						if (typeof this.props.onClick == "function") this.props.onClick(e, this);
						if (typeof childProps.onClick == "function") childProps.onClick(e, childThis);
						if (typeof this.props.text == "function") this.updateTooltip(this.props.text(this, e));
					};
					child.props.onContextMenu = (e, childThis) => {
						if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
						if (typeof childProps.onContextMenu == "function") childProps.onContextMenu(e, childThis);
						if (typeof this.props.text == "function") this.updateTooltip(this.props.text(this, e));
					};
					return BDFDB.ReactUtils.createElement(Internal.LibraryModules.React.Fragment, {
						children: child
					});
				}
			};
			
			CustomComponents.UserPopoutContainer = reactInitialized && class BDFDB_UserPopoutContainer extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement(Internal.LibraryComponents.PopoutContainer, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						wrap: false,
						renderPopout: instance => BDFDB.ReactUtils.createElement(Internal.LibraryComponents.UserPopout, {
							user: Internal.LibraryModules.UserStore.getUser(this.props.userId),
							userId: this.props.userId,
							channelId: this.props.channelId,
							guildId: this.props.guildId
						}),
					}), "userId", "channelId", "guildId"));
				}
			};
			
			const VideoInner = function (props) {
				let ref = BDFDB.ReactUtils.useRef(null);
				BDFDB.ReactUtils.useEffect(_ => {
					if (ref.current) props.play ? ref.current.play() : ref.current.pause();
				}, [props.play]);
				return props.naturalWidth <= BDFDB.DiscordConstants.MAX_VIDEO_WIDTH && props.naturalHeight <= BDFDB.DiscordConstants.MAX_VIDEO_HEIGHT || props.naturalWidth <= BDFDB.DiscordConstants.MAX_VIDEO_HEIGHT && props.naturalHeight <= BDFDB.DiscordConstants.MAX_VIDEO_WIDTH ? BDFDB.ReactUtils.createElement(Internal.LibraryComponents.VideoForwardRef, {
					ref: ref,
					className: props.className,
					poster: props.poster,
					src: props.src,
					width: props.width,
					height: props.height,
					muted: true,
					loop: true,
					autoPlay: props.play,
					preload: "none"
				}) : BDFDB.ReactUtils.createElement("img", {
					alt: "",
					src: props.poster,
					width: props.width,
					height: props.height
				});
			};
			CustomComponents.Video = reactInitialized && class BDFDB_Video extends Internal.LibraryModules.React.Component {
				render() {
					return BDFDB.ReactUtils.createElement(VideoInner, this.props);
				}
			};
			
			const NativeSubComponents = {};
			Internal.NativeSubComponents = new Proxy(NativeSubComponents, {
				get: function (_, item) {
					if (NativeSubComponents[item]) return NativeSubComponents[item];
					if (!InternalData.NativeSubComponents[item]) return "div";
					if (InternalData.NativeSubComponents[item].name) {
						if (InternalData.NativeSubComponents[item].protos) {
							NativeSubComponents[item] = BDFDB.ModuleUtils.find(m => m && m.displayName == InternalData.NativeSubComponents[item].name && m.prototype && InternalData.NativeSubComponents[item].protos.every(proto => m.prototype[proto]) && m);
							if (!NativeSubComponents[item]) BDFDB.LogUtils.warn(`${JSON.stringify([InternalData.NativeSubComponents[item].name, InternalData.NativeSubComponents[item].protos].flat(10))} [name + protos] not found in WebModules`);
						}
						else NativeSubComponents[item] = BDFDB.ModuleUtils.findByName(InternalData.NativeSubComponents[item].name);
					}
					else if (InternalData.NativeSubComponents[item].props) NativeSubComponents[item] = BDFDB.ModuleUtils.findByProperties(InternalData.NativeSubComponents[item].props);
					return NativeSubComponents[item] ? NativeSubComponents[item] : "div";
				}
			});
			
			const LibraryComponents = {};
			Internal.LibraryComponents = new Proxy(LibraryComponents, {
				get: function (_, item) {
					if (LibraryComponents[item]) return LibraryComponents[item];
					if (!InternalData.LibraryComponents[item] && !CustomComponents[item]) return "div";
					if (InternalData.LibraryComponents[item]) {
						if (InternalData.LibraryComponents[item].name) LibraryComponents[item] = BDFDB.ModuleUtils.findByName(InternalData.LibraryComponents[item].name);
						else if (InternalData.LibraryComponents[item].strings) LibraryComponents[item] = BDFDB.ModuleUtils.findByString(InternalData.LibraryComponents[item].strings);
						else if (InternalData.LibraryComponents[item].props) LibraryComponents[item] = BDFDB.ModuleUtils.findByProperties(InternalData.LibraryComponents[item].props);
						if (InternalData.LibraryComponents[item].value) LibraryComponents[item] = (LibraryComponents[item] || {})[InternalData.LibraryComponents[item].value];
						if (InternalData.LibraryComponents[item].assign) LibraryComponents[item] = Object.assign({}, LibraryComponents[item]);
					}
					if (CustomComponents[item]) LibraryComponents[item] = LibraryComponents[item] ? Object.assign({}, LibraryComponents[item], CustomComponents[item]) : CustomComponents[item];
					
					const NativeComponent = LibraryComponents[item] && Internal.NativeSubComponents[item];
					if (NativeComponent && typeof NativeComponent != "string") {
						for (let key in NativeComponent) if (key != "displayName" && key != "name" && (typeof NativeComponent[key] != "function" || key.charAt(0) == key.charAt(0).toUpperCase())) {
							if (key == "defaultProps") LibraryComponents[item][key] = Object.assign({}, LibraryComponents[item][key], NativeComponent[key]);
							else if (!LibraryComponents[item][key]) LibraryComponents[item][key] = NativeComponent[key];
						}
					}
					if (InternalData.LibraryComponents[item] && InternalData.LibraryComponents[item].children) {
						const SubComponents = LibraryComponents[item] && typeof LibraryComponents[item] == "object" ? LibraryComponents[item] : {};
						const InternalParentData = InternalData.LibraryComponents[item].children;
						LibraryComponents[item] = new Proxy(BDFDB.ObjectUtils.is(SubComponents) ? SubComponents : {}, {
							get: function (_, item2) {
								if (CustomComponents[item] && CustomComponents[item][item2]) return CustomComponents[item][item2];
								if (SubComponents[item2]) return SubComponents[item2];
								if (!InternalParentData[item2]) return "div";
								if (InternalParentData[item2].name) SubComponents[item2] = BDFDB.ModuleUtils.findByName(InternalParentData[item2].name);
								else if (InternalParentData[item2].strings) SubComponents[item2] = BDFDB.ModuleUtils.findByString(InternalParentData[item2].strings);
								else if (InternalParentData[item2].props) SubComponents[item2] = BDFDB.ModuleUtils.findByProperties(InternalParentData[item2].props); 
								
								if (InternalParentData[item2].value) SubComponents[item2] = (SubComponents[item2] || {})[InternalParentData[item2].value];
								if (InternalParentData[item2].assign) SubComponents[item] = Object.assign({}, SubComponents[item2]);
								if (CustomComponents[item2]) SubComponents[item2] = SubComponents[item2] ? Object.assign({}, SubComponents[item2], CustomComponents[item2]) : CustomComponents[item2];
								
								const NativeComponent = Internal.NativeSubComponents[item2];
								if (NativeComponent && typeof NativeComponent != "string") {
									for (let key in NativeComponent) if (key != "displayName" && key != "name" && (typeof NativeComponent[key] != "function" || key.charAt(0) == key.charAt(0).toUpperCase())) {
										if (key == "defaultProps") SubComponents[item2][key] = Object.assign({}, SubComponents[item2][key], NativeComponent[key]);
										else if (!SubComponents[item2][key]) SubComponents[item2][key] = NativeComponent[key];
									}
								}
								return SubComponents[item2] ? SubComponents[item2] : "div";
							}
						});
					}
					return LibraryComponents[item] ? LibraryComponents[item] : "div";
				}
			});
			
			BDFDB.LibraryComponents = Internal.LibraryComponents;
			
			Internal.createCustomControl = function (data) {
				let controlButton = BDFDB.DOMUtils.create(`<button class="${BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repobutton, BDFDB.disCN._repocontrolsbutton, BDFDB.disCN._repocontrolscustom)}"></button>`);
				BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
					nativeClass: true,
					name: data.svgName,
					width: 20,
					height: 20
				}), controlButton);
				controlButton.addEventListener("click", _ => {if (typeof data.onClick == "function") data.onClick();});
				if (data.tooltipText) controlButton.addEventListener("mouseenter", _ => {BDFDB.TooltipUtils.create(controlButton, data.tooltipText);});
				return controlButton;
			};
			Internal.appendCustomControls = function (card) {
				if (!card || card.querySelector(BDFDB.dotCN._repocontrolscustom)) return;
				let checkbox = card.querySelector(BDFDB.dotCN._reposwitch);
				if (!checkbox) return;
				let props = BDFDB.ObjectUtils.get(BDFDB.ReactUtils.getInstance(card), "return.stateNode.props");
				let plugin = props && props.addon && (props.addon.plugin || props.addon.instance);
				if (plugin && (plugin == libraryInstance || plugin.name && plugin.name && PluginStores.loaded[plugin.name] && PluginStores.loaded[plugin.name] == plugin)) {
					let url = Internal.getPluginURL(plugin);
					let controls = [];
					let footerControls = card.querySelector(BDFDB.dotCNS._repofooter + BDFDB.dotCN._repocontrols);
					if (plugin.changeLog) controls.push(Internal.createCustomControl({
						tooltipText: BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG,
						svgName: Internal.LibraryComponents.SvgIcon.Names.CHANGELOG,
						onClick: _ => {BDFDB.PluginUtils.openChangeLog(plugin);}
					}));
					if (PluginStores.updateData.plugins[url] && PluginStores.updateData.plugins[url].outdated) controls.push(Internal.createCustomControl({
						tooltipText: BDFDB.LanguageUtils.LanguageStrings.UPDATE_MANUALLY,
						svgName: Internal.LibraryComponents.SvgIcon.Names.DOWNLOAD,
						onClick: _ => {BDFDB.PluginUtils.downloadUpdate(plugin.name, url);}
					}));
					if (footerControls) for (let control of controls) footerControls.insertBefore(control, footerControls.firstElementChild);
					else for (let control of controls) checkbox.parentElement.insertBefore(control, checkbox.parentElement.firstElementChild);
				}
			};
			Internal.addListObserver = function (layer) {
				if (!layer) return;
				BDFDB.ObserverUtils.connect(BDFDB, layer, {name: "cardObserver", instance: new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(n => {
					if (BDFDB.DOMUtils.containsClass(n, BDFDB.disCN._repocard)) Internal.appendCustomControls(n);
					if (n.nodeType != Node.TEXT_NODE) for (let c of n.querySelectorAll(BDFDB.dotCN._repocard)) Internal.appendCustomControls(c);
					Internal.appendCustomControls(BDFDB.DOMUtils.getParent(BDFDB.dotCN._repocard, n));
				});}});})}, {childList: true, subtree: true});
				for (let c of layer.querySelectorAll(BDFDB.dotCN._repocard)) Internal.appendCustomControls(c);
			}

			const keyDownTimeouts = {};
			BDFDB.ListenerUtils.add(BDFDB, document, "keydown.BDFDBPressedKeys", e => {
				if (!pressedKeys.includes(e.which)) {
					BDFDB.TimeUtils.clear(keyDownTimeouts[e.which]);
					pressedKeys.push(e.which);
					keyDownTimeouts[e.which] = BDFDB.TimeUtils.timeout(_ => {
						BDFDB.ArrayUtils.remove(pressedKeys, e.which, true);
					}, 60000);
				}
			});
			BDFDB.ListenerUtils.add(BDFDB, document, "keyup.BDFDBPressedKeys", e => {
				BDFDB.TimeUtils.clear(keyDownTimeouts[e.which]);
				BDFDB.ArrayUtils.remove(pressedKeys, e.which, true);
			});
			BDFDB.ListenerUtils.add(BDFDB, document, "mousedown.BDFDBMousePosition", e => {
				mousePosition = e;
			});
			BDFDB.ListenerUtils.add(BDFDB, window, "focus.BDFDBPressedKeysReset", e => {
				pressedKeys = [];
			});
			
			Internal.patchedModules = {
				before: {
					SearchBar: "render",
					EmojiPicker: "type",
					EmojiPickerListRow: "default"
				},
				after: {
					useCopyIdItem: "default",
					Menu: "default",
					SettingsView: "componentDidMount",
					Shakeable: "render",
					Message: "default",
					MessageToolbar: "type",
					MessageHeader: "default",
					MemberListItem: ["componentDidMount", "componentDidUpdate"],
					PrivateChannel: ["componentDidMount", "componentDidUpdate"],
					AnalyticsContext: ["componentDidMount", "componentDidUpdate"],
					PeopleListItem: ["componentDidMount", "componentDidUpdate"],
					DiscordTag: "default"
				}
			};
			
			Internal.processUseCopyIdItem = function (e) {
				if (!e.returnvalue) e.returnvalue = false;
			};
			
			const menuExtraPatches = {};
			Internal.processMenu = function (e) {
				if (e.instance.props.navId) switch (e.instance.props.navId) {
					case "guild-header-popout":
						if (menuExtraPatches["guild-header-popout"]) return;
						menuExtraPatches["guild-header-popout"] = true;
						BDFDB.TimeUtils.interval((interval, count) => {
							if (count > 20) return BDFDB.TimeUtils.clear(interval);
							else {
								let module = BDFDB.ModuleUtils.findByString("guild-header-popout");
								if (module) BDFDB.PatchUtils.patch(BDFDB, module.default.prototype, "render", {after: e2 => {
									BDFDB.PatchUtils.patch(BDFDB, e2.returnValue.type, "type", {after: e3 => {
										Internal.triggerQueuePatch("GuildHeaderContextMenu", {
											arguments: e3.methodArguments,
											instance: {props: e3.methodArguments[0]},
											returnvalue: e3.returnValue,
											component: e2.returnValue,
											methodname: "type",
											type: "GuildHeaderContextMenu"
										});
									}}, {noCache: true});
								}});
							}
						}, 500);
						return;
				}
				if (!e.instance.props.children || BDFDB.ArrayUtils.is(e.instance.props.children) && !e.instance.props.children.length) Internal.LibraryModules.ContextMenuUtils.closeContextMenu();
			};
			
				
			Internal.processSearchBar = function (e) {
				if (typeof e.instance.props.query != "string") e.instance.props.query = "";
			};
				
			Internal.processSettingsView = function (e) {
				if (e.node && e.node.parentElement && e.node.parentElement.getAttribute("aria-label") == BDFDB.DiscordConstants.Layers.USER_SETTINGS) Internal.addListObserver(e.node.parentElement);
			};
		
			let AppViewExport = InternalData.ModuleUtilsConfig.Finder.AppView && BDFDB.ModuleUtils.findByString(InternalData.ModuleUtilsConfig.Finder.AppView.strings, false);
			if (AppViewExport) Internal.processShakeable = function (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {filter: n => {
					if (!n || typeof n.type != "function") return;
					let typeString = n.type.toString();
					return [InternalData.ModuleUtilsConfig.Finder.AppView.strings].flat(10).filter(n => typeof n == "string").every(string => typeString.indexOf(string) > -1);
				}});
				if (index > -1) children[index] = BDFDB.ReactUtils.createElement(AppViewExport.exports.default, children[index].props);
			};
			
			Internal.processMessage = function (e) {
				if (e.returnvalue && e.returnvalue.props && e.returnvalue.props.children && e.returnvalue.props.children.props) {
					let message;
					for (let key in e.instance.props) {
						if (!message) message = BDFDB.ObjectUtils.get(e.instance.props[key], "props.message");
						else break;
					}
					if (message) {
						e.returnvalue.props.children.props[InternalData.authorIdAttribute] = message.author.id;
						if (Internal.LibraryModules.RelationshipStore.isFriend(message.author.id)) e.returnvalue.props.children.props[InternalData.authorFriendAttribute] = true;
						if (message.author.id == BDFDB.UserUtils.me.id) e.returnvalue.props.children.props[InternalData.authorSelfAttribute] = true;
					}
				}
			};
			
			Internal.processMessageToolbar = function (e) {
				if (document.querySelector(BDFDB.dotCN.emojipicker) || !BDFDB.ObjectUtils.toArray(PluginStores.loaded).filter(p => p.started).some(p => p.onSystemMessageOptionContextMenu || p.onSystemMessageOptionToolbar || p.onMessageOptionContextMenu || p.onMessageOptionToolbar)) return;
				let toolbar = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.props && c.props.showMoreUtilities != undefined && c.props.showEmojiPicker != undefined && c.props.setPopout != undefined});
				if (toolbar) BDFDB.PatchUtils.patch(BDFDB, toolbar, "type", {after: e2 => {
					let menu = BDFDB.ReactUtils.findChild(e2.returnValue, {filter: c => c && c.props && typeof c.props.onRequestClose == "function" && c.props.onRequestClose.toString().indexOf("moreUtilities") > -1});
					let isSystem = BDFDB.MessageUtils.isSystemMessage(e2.methodArguments[0] && e2.methodArguments[0].message);
					Internal.triggerQueuePatch(isSystem ? "SystemMessageOptionToolbar" : "MessageOptionToolbar", {
						arguments: e2.methodArguments,
						instance: {props: e2.methodArguments[0]},
						returnvalue: e2.returnValue,
						methodname: "default",
						type: isSystem ? "SystemMessageOptionToolbar" : "MessageOptionToolbar"
					});
					if (menu && typeof menu.props.renderPopout == "function") {
						let renderPopout = menu.props.renderPopout;
						menu.props.renderPopout = BDFDB.TimeUtils.suppress((...args) => {
							let renderedPopout = renderPopout(...args);
							renderedPopout.props.updatePosition = _ => {};
							BDFDB.PatchUtils.patch(BDFDB, renderedPopout, "type", {after: e3 => {
								let isSystem = BDFDB.MessageUtils.isSystemMessage(e3.methodArguments[0] && e3.methodArguments[0].message);
								Internal.triggerQueuePatch(isSystem ? "SystemMessageOptionContextMenu" : "MessageOptionContextMenu", {
									arguments: e3.methodArguments,
									instance: {props: e3.methodArguments[0]},
									returnvalue: e3.returnValue,
									methodname: "default",
									type: isSystem ? "SystemMessageOptionContextMenu" : "MessageOptionContextMenu"
								});
							}}, {noCache: true});
							return renderedPopout;
						}, "Error in Popout Render of MessageOptionToolbar!");
					}
				}}, {once: true});
			};

			const BDFDB_Patrons = Object.assign({}, InternalData.BDFDB_Patrons), BDFDB_Patron_Tiers = Object.assign({}, InternalData.BDFDB_Patron_Tiers);
			Internal._processAvatarRender = function (user, avatar, className) {
				if (BDFDB.ReactUtils.isValidElement(avatar) && BDFDB.ObjectUtils.is(user) && (avatar.props.className || "").indexOf(BDFDB.disCN.bdfdbbadgeavatar) == -1) {
					avatar.props[InternalData.userIdAttribute] = user.id;
					let role = "", note = "", color, link, addBadge = Internal.settings.general.showSupportBadges;
					if (BDFDB_Patrons[user.id] && BDFDB_Patrons[user.id].active) {
						link = "https://www.patreon.com/MircoWittrien";
						role = BDFDB_Patrons[user.id].text || (BDFDB_Patron_Tiers[BDFDB_Patrons[user.id].tier] || {}).text;
						note = BDFDB_Patrons[user.id].text && (BDFDB_Patron_Tiers[BDFDB_Patrons[user.id].tier] || {}).text;
						color = BDFDB_Patrons[user.id].color;
						className = BDFDB.DOMUtils.formatClassName(avatar.props.className, className, addBadge && BDFDB.disCN.bdfdbhasbadge, BDFDB.disCN.bdfdbbadgeavatar, BDFDB.disCN.bdfdbsupporter, BDFDB.disCN[`bdfdbsupporter${BDFDB_Patrons[user.id].tier}`]);
					}
					else if (user.id == InternalData.myId) {
						addBadge = true;
						role = `Theme ${BDFDB.LanguageUtils.LibraryStrings.developer}`;
						className = BDFDB.DOMUtils.formatClassName(avatar.props.className, className, BDFDB.disCN.bdfdbhasbadge, BDFDB.disCN.bdfdbbadgeavatar, BDFDB.disCN.bdfdbdev);
					}
					if (role) {
						delete avatar.props[InternalData.userIdAttribute];
						if (avatar.type == "img") avatar = BDFDB.ReactUtils.createElement(Internal.LibraryComponents.AvatarComponents.default, Object.assign({}, avatar.props, {
							size: Internal.LibraryComponents.AvatarComponents.Sizes.SIZE_40
						}));
						delete avatar.props.className;
						let newProps = {
							className: className,
							children: [avatar]
						};
						newProps[InternalData.userIdAttribute] = user.id;
						avatar = BDFDB.ReactUtils.createElement("div", newProps);
						if (addBadge) avatar.props.children.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.TooltipContainer, {
							text: role,
							note: note,
							tooltipConfig: {backgroundColor: color || ""},
							onClick: link ? (_ => BDFDB.DiscordUtils.openLink(link)) : (_ => {}),
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.bdfdbbadge
							})
						}));
						return avatar;
					}
				}
			};
			Internal._processAvatarMount = function (user, avatar, wrapper) {
				if (!user) return;
				if (wrapper) wrapper.setAttribute(InternalData.userIdAttribute, user.id);
				if (Node.prototype.isPrototypeOf(avatar) && (avatar.className || "").indexOf(BDFDB.disCN.bdfdbbadgeavatar) == -1) {
					avatar.setAttribute(InternalData.userIdAttribute, user.id);
					let role = "", note = "", color, link, addBadge = Internal.settings.general.showSupportBadges;
					if (BDFDB_Patrons[user.id] && BDFDB_Patrons[user.id].active) {
						link = "https://www.patreon.com/MircoWittrien";
						role = BDFDB_Patrons[user.id].text || (BDFDB_Patron_Tiers[BDFDB_Patrons[user.id].tier] || {}).text;
						note = BDFDB_Patrons[user.id].text && (BDFDB_Patron_Tiers[BDFDB_Patrons[user.id].tier] || {}).text;
						color = BDFDB_Patrons[user.id].color;
						avatar.className = BDFDB.DOMUtils.formatClassName(avatar.className, addBadge && BDFDB.disCN.bdfdbhasbadge, BDFDB.disCN.bdfdbbadgeavatar, BDFDB.disCN.bdfdbsupporter, BDFDB.disCN[`bdfdbsupporter${BDFDB_Patrons[user.id].tier}`]);
					}
					else if (user.id == InternalData.myId) {
						addBadge = true;
						role = `Theme ${BDFDB.LanguageUtils.LibraryStrings.developer}`;
						avatar.className = BDFDB.DOMUtils.formatClassName(avatar.className, addBadge && BDFDB.disCN.bdfdbhasbadge, BDFDB.disCN.bdfdbbadgeavatar, BDFDB.disCN.bdfdbdev);
					}
					if (addBadge && role && !avatar.querySelector(BDFDB.dotCN.bdfdbbadge)) {
						let badge = document.createElement("div");
						badge.className = BDFDB.disCN.bdfdbbadge;
						if (link) badge.addEventListener("click", _ => BDFDB.DiscordUtils.openLink(link));
						badge.addEventListener("mouseenter", _ => BDFDB.TooltipUtils.create(badge, role, {position: "top", note: note, backgroundColor: color || ""}));
						avatar.appendChild(badge);
					}
				}
			};
			Internal._processUserInfoNode = function (user, wrapper) {
				if (!user || !wrapper) return;
				if (InternalData.UserBackgrounds[user.id]) for (let property in InternalData.UserBackgrounds[user.id]) wrapper.style.setProperty(property, InternalData.UserBackgrounds[user.id][property], "important");
			};
			Internal.processMessageHeader = function (e) {
				if (e.instance.props.message && e.instance.props.message.author) {
					let avatarWrapper = e.returnvalue.props.avatar || BDFDB.ObjectUtils.get(e, "returnvalue.props.children.0");
					if (avatarWrapper && avatarWrapper.props && typeof avatarWrapper.props.children == "function") {
						let renderChildren = avatarWrapper.props.children;
						avatarWrapper.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let renderedChildren = renderChildren(...args);
							return Internal._processAvatarRender(e.instance.props.message.author, renderedChildren, BDFDB.disCN.messageavatar) || renderedChildren;
						}, "Error in Avatar Render of MessageHeader!");
					}
					else if (avatarWrapper && avatarWrapper.type == "img") e.returnvalue.props.children[0] = Internal._processAvatarRender(e.instance.props.message.author, avatarWrapper) || avatarWrapper;
				}
			};
			Internal.processMemberListItem = function (e) {
				Internal._processAvatarMount(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.avatarwrapper), e.node);
			};
			Internal.processPrivateChannel = function (e) {
				Internal._processAvatarMount(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.avatarwrapper), e.node);
			};
			Internal.processAnalyticsContext = function (e) {
				if (e.instance.props.section != BDFDB.DiscordConstants.AnalyticsSections.PROFILE_MODAL && e.instance.props.section != BDFDB.DiscordConstants.AnalyticsSections.PROFILE_POPOUT) return;
				const user = BDFDB.ReactUtils.findValue(e.instance, "user");
				if (!user) return;
				const wrapper = e.node.querySelector(BDFDB.dotCNC.userpopout + BDFDB.dotCN.userprofile) || e.node;
				const avatar = e.node.querySelector(BDFDB.dotCN.avatarwrapper);
				if (avatar) Internal._processAvatarMount(user, e.instance.props.section == BDFDB.DiscordConstants.AnalyticsSections.PROFILE_POPOUT ? avatar.parentElement : avatar, wrapper);
				Internal._processUserInfoNode(user, wrapper);
			};
			Internal.processPeopleListItem = function (e) {
				if (e.instance.props.user) e.node.setAttribute(InternalData.userIdAttribute, e.instance.props.user.id);
			};
			Internal.processDiscordTag = function (e) {
				if (e.instance && e.instance.props && e.returnvalue && e.instance.props.user) e.returnvalue.props.user = e.instance.props.user;
			};
			Internal.processEmojiPicker = function (e) {
				if (BDFDB.ObjectUtils.toArray(PluginStores.loaded).filter(p => p.started).some(p => p.onSystemMessageOptionContextMenu || p.onSystemMessageOptionToolbar || p.onMessageOptionContextMenu || p.onMessageOptionToolbar)) e.instance.props.persistSearch = true;
			};
			Internal.processEmojiPickerListRow = function (e) {
				if (e.instance.props.emojiDescriptors && Internal.LibraryComponents.EmojiPickerButton.current && Internal.LibraryComponents.EmojiPickerButton.current.props && Internal.LibraryComponents.EmojiPickerButton.current.props.allowManagedEmojisUsage) for (let i in e.instance.props.emojiDescriptors) e.instance.props.emojiDescriptors[i] = Object.assign({}, e.instance.props.emojiDescriptors[i], {isDisabled: false});
			};
			
			Internal.addChunkObserver = function (pluginData, config) {
				let module;
				if (config.stringFind) module = BDFDB.ModuleUtils.findByString(config.stringFind, config.exported, true);
				else if (config.propertyFind) module = BDFDB.ModuleUtils.findByProperties(config.propertyFind, config.exported, true);
				else if (config.prototypeFind) module = BDFDB.ModuleUtils.findByPrototypes(config.prototypeFind, config.exported, true);
				else module = BDFDB.ModuleUtils.findByName(config.name, config.exported, true);
				if (module) {
					let exports = !config.exported && module.exports || module;
					exports = config.path && BDFDB.ObjectUtils.get(exports, config.path) || exports;
					exports && Internal.patchComponent(pluginData, Internal.isMemoOrForwardRef(exports) ? exports.default : exports, config);
				}
				else {
					if (!PluginStores.chunkObserver[config.mappedType]) {
						PluginStores.chunkObserver[config.mappedType] = {query: [], config};
						let filter;
						if (config.stringFind) filter = m => m && Internal.hasModuleStrings(m, config.stringFind) && m;
						else if (config.propertyFind) filter = m => [config.propertyFind].flat(10).filter(n => n).every(prop => {
							const value = m[prop];
							return value !== undefined && !(typeof value == "string" && !value);
						}) && m;
						else if (config.prototypeFind) filter = m =>  m.prototype && [config.prototypeFind].flat(10).filter(n => n).every(prop => {
							const value = m.prototype[prop];
							return value !== undefined && !(typeof value == "string" && !value);
						}) && m;
						else filter = m => m.displayName === config.name && m || m.render && m.render.displayName === config.name && m || m[config.name] && m[config.name].displayName === name && m[config.name];
						PluginStores.chunkObserver[config.mappedType].filter = filter;
					}
					PluginStores.chunkObserver[config.mappedType].query.push(pluginData);
				}
			};
			Internal.addQueuePatches = function (plugin) {
				if (!InternalData.ModuleUtilsConfig.QueuedComponents) return;
				plugin = plugin == BDFDB && Internal || plugin;
				for (let type of InternalData.ModuleUtilsConfig.QueuedComponents) if (typeof plugin[`on${type}`] == "function") {
					if (PluginStores.patchQueues[type].query.indexOf(plugin) == -1) {
						PluginStores.patchQueues[type].query.push(plugin);
						PluginStores.patchQueues[type].query.sort((x, y) => x.name < y.name ? -1 : x.name > y.name ? 1 : 0);
					}
				}
			};
			Internal.triggerQueuePatch = function (type, e) {
				if (e.returnvalue && BDFDB.ObjectUtils.is(PluginStores.patchQueues[type]) && BDFDB.ArrayUtils.is(PluginStores.patchQueues[type].query)) {
					for (let plugin of PluginStores.patchQueues[type].query) if(typeof plugin[`on${type}`] == "function") plugin[`on${type}`](e);
				}
			};
			Internal.addContextChunkObservers = function (plugin) {
				if (!InternalData.ModuleUtilsConfig.ContextMenuTypes) return;
				plugin = plugin == BDFDB && Internal || plugin;
				for (let type of InternalData.ModuleUtilsConfig.ContextMenuTypes) {
					type = `${type}ContextMenu`;
					if (typeof plugin[`on${InternalData.ModuleUtilsConfig.ContextMenuTypesMap[type] || type}`] == "function") {
						for (let module of PluginStores.contextChunkObserver[type].modules) Internal.patchContextMenu(plugin, type, module);
						if (PluginStores.contextChunkObserver[type].query.indexOf(plugin) == -1) {
							PluginStores.contextChunkObserver[type].query.push(plugin);
							PluginStores.contextChunkObserver[type].query.sort((x, y) => x.name < y.name ? -1 : x.name > y.name ? 1 : 0);
						}
					}
				}
			};
			Internal.patchContextMenu = function (plugin, type, module) {
				if (!module || !module.default) return;
				plugin = plugin == BDFDB && Internal || plugin;
				const mappedType = InternalData.ModuleUtilsConfig.ContextMenuTypesMap[type] || type;
				if (!InternalData.ModuleUtilsConfig.ContextMenuSubItemsMap[mappedType]) {
					const call = (args, props, returnValue, name) => {
						if (!returnValue || !returnValue.props || !returnValue.props.children || returnValue.props.children.__BDFDBPatchesCalled && returnValue.props.children.__BDFDBPatchesCalled[plugin.name]) return;
						returnValue.props.children.__BDFDBPatchesCalled = Object.assign({}, returnValue.props.children.__BDFDBPatchesCalled, {[plugin.name]: true});
						return plugin[`on${mappedType}`]({
							arguments: args,
							instance: {props: props},
							returnvalue: returnValue,
							component: module,
							methodname: "default",
							type: name
						});
					};
					BDFDB.PatchUtils.patch(plugin, module, "default", {after: e => {
						if (typeof plugin[`on${mappedType}`] != "function") return;
						else if (e.returnValue && e.returnValue.props.children !== undefined) {
							if (e.returnValue.props.navId) {
								e.returnValue.props.children = [e.returnValue.props.children].flat(10);
								call(e.methodArguments, e.methodArguments[0], e.returnValue, module.default.displayName);
							}
							if (e.returnValue.props.children && e.returnValue.props.children.type && e.returnValue.props.children.type.displayName) {
								const name = e.returnValue.props.children.type.displayName;
								const originalReturn = e.returnValue.props.children.type(e.returnValue.props.children.props);
								if (!originalReturn || !originalReturn.type) return;
								let newType = (...args) => {
									const returnValue = BDFDB.ReactUtils.createElement(originalReturn.type, originalReturn.props);
									if (returnValue.props.children) call(args, args[0], returnValue, name);
									else BDFDB.PatchUtils.patch(plugin, returnValue, "type", {after: e2 => {
										if (e2.returnValue && typeof plugin[`on${type}`] == "function") call(e2.methodArguments, e2.methodArguments[0], e2.returnValue, name);
									}}, {noCache: true});
									return returnValue;
								};
								newType.displayName = name;
								e.returnValue.props.children = BDFDB.ReactUtils.createElement(newType, e.returnValue.props.children.props);
							}
						}
						else BDFDB.PatchUtils.patch(plugin, e.returnValue, "type", {after: e2 => {
							if (e2.returnValue && typeof plugin[`on${mappedType}`] == "function") call(e2.methodArguments, e2.methodArguments[0], e2.returnValue, module.default.displayName);
						}}, {noCache: true});
					}}, {name: type});
				}
				else {
					const getProps = (props, keys) => {
						let newProps = Object.assign({}, BDFDB.ObjectUtils.is(props) ? props : typeof props == "string" ? {id: props} : {});
						for (const key of [keys].flat(10).filter(n => n)) {
							const store = `${Internal.LibraryModules.StringUtils.upperCaseFirstChar(key)}Store`;
							const getter = `get${Internal.LibraryModules.StringUtils.upperCaseFirstChar(key)}`;
							const value = props && props[key] || Internal.LibraryModules[store] && typeof Internal.LibraryModules[store][getter] == "function" && Internal.LibraryModules[store][getter](props && props.id || props);
							if (value) {
								newProps = Object.assign(newProps, {[key]: value});
								break;
							}
						}
						return newProps;
					};
					BDFDB.PatchUtils.patch(plugin, module, "default", {after: e => {
						if (typeof plugin[`on${mappedType}`] != "function") return;
						e.returnValue = [e.returnValue].flat(10).filter(n => n);
						return plugin[`on${mappedType}`]({
							arguments: e.methodArguments,
							instance: {props: InternalData.ModuleUtilsConfig.ContextMenuSubItemsMap[mappedType].keys && getProps(e.methodArguments[0], InternalData.ModuleUtilsConfig.ContextMenuSubItemsMap[mappedType].keys) || e.methodArguments[0]},
							returnvalue: e.returnValue,
							component: module,
							methodname: "default",
							type: type,
							subType: module.__BDFDB_ContextMenu_Patch_Name
						});
					}}, {name: type});
				}
			};
			
			BDFDB.ReactUtils.instanceKey = Object.keys(document.querySelector(BDFDB.dotCN.app) || {}).some(n => n.startsWith("__reactInternalInstance")) ? "_reactInternalFiber" : "_reactInternals";

			BDFDB.PluginUtils.load(BDFDB);
			Internal.settings = BDFDB.DataUtils.get(Internal);
			changeLogs = BDFDB.DataUtils.load(BDFDB, "changeLogs");
			BDFDB.PluginUtils.checkChangeLog(BDFDB);
			
			(_ => {
				const chunkName = "webpackChunkdiscord_app";
				const originalPush = window[chunkName].push;
				const patches = {};
				const handlePush = chunk => {
					for (const id in chunk[1]) {
						const origModule = chunk[1][id];
						chunk[1][id] = (module, exports, require) => {
							Reflect.apply(origModule, null, [module, exports, require]);
							const removedTypes = [];
							for (const type in PluginStores.chunkObserver) {
								const foundModule = PluginStores.chunkObserver[type].filter(exports) || exports.default && PluginStores.chunkObserver[type].filter(exports.default);
								if (foundModule) {
									Internal.patchComponent(PluginStores.chunkObserver[type].query, PluginStores.chunkObserver[type].config.exported ? foundModule : exports, PluginStores.chunkObserver[type].config);
									removedTypes.push(type);
									break;
								}
							}
							while (removedTypes.length) delete PluginStores.chunkObserver[removedTypes.pop()];
							
							let found = false, funcString = exports && exports.default && typeof exports.default == "function" && exports.default.toString();
							if (funcString && funcString.indexOf(".page") > -1 && funcString.indexOf(".section") > -1 && funcString.indexOf(".objectType") > -1) {
								const returnValue = exports.default({});
								if (returnValue && returnValue.props && returnValue.props.object == BDFDB.DiscordConstants.AnalyticsObjects.CONTEXT_MENU) {
									for (const type in PluginStores.contextChunkObserver) {
										if (PluginStores.contextChunkObserver[type].filter(returnValue.props.children)) {
											exports.__BDFDB_ContextMenuWrapper_Patch_Name = exports.__BDFDB_ContextMenu_Patch_Name;
											found = true;
											if (PluginStores.contextChunkObserver[type].modules.indexOf(exports) == -1) PluginStores.contextChunkObserver[type].modules.push(exports);
											for (const plugin of PluginStores.contextChunkObserver[type].query) Internal.patchContextMenu(plugin, type, exports);
											break;
										}
									}
								}
							}
							if (!found) for (const type in PluginStores.contextChunkObserver) {
								if (PluginStores.contextChunkObserver[type].filter(exports)) {
									if (PluginStores.contextChunkObserver[type].modules.indexOf(exports) == -1) PluginStores.contextChunkObserver[type].modules.push(exports);
									for (const plugin of PluginStores.contextChunkObserver[type].query) Internal.patchContextMenu(plugin, type, exports);
									break;
								}
							}
						};
						Object.assign(chunk[1][id], origModule, {toString: _ => origModule.toString()});
						patches[id] = [chunk, origModule];
					}
					return Reflect.apply(originalPush, window[chunkName], [chunk]);
				};
				
				Object.defineProperty(window[chunkName], "push", {
					configurable: true,
					get: _ => handlePush,
					set: newPush => {
						originalPush = newPush;
						Object.defineProperty(window[chunkName], "push", {
							value: handlePush,
							configurable: true,
							writable: true
						});
					}
				});
				Internal.removeChunkObserver = _ => {
					for (let id in patches) {
						patches[id][0] = patches[id][1];
						patches[id] = null;
					}
					Object.defineProperty(window[chunkName], "push", {
						configurable: true,
						get: _ => (chunk => Reflect.apply(originalPush, window[chunkName], [chunk]))
					});
				};
			})();
			
			if (InternalData.ModuleUtilsConfig.ContextMenuTypes) for (let type of InternalData.ModuleUtilsConfig.ContextMenuTypes) {
				type = `${type}ContextMenu`;
				if (!PluginStores.contextChunkObserver[type]) {
					const mappedType = InternalData.ModuleUtilsConfig.ContextMenuTypesMap[type] || type;
					PluginStores.contextChunkObserver[type] = {query: [], modules: []};
					if (!InternalData.ModuleUtilsConfig.ContextMenuSubItemsMap[mappedType]) PluginStores.contextChunkObserver[type].filter = m => {
						if (!m || !(m.default || m.type)) return;
						const d = m.default || m.type;
						if (d.displayName && d.displayName.endsWith("ContextMenu") && `${InternalData.ModuleUtilsConfig.ContextMenuTypes.find(t => d.displayName.indexOf(t) > -1)}ContextMenu` == type) {
							m.__BDFDB_ContextMenu_Patch_Name = type;
							return true;
						}
						else if (m.__BDFDB_ContextMenuWrapper_Patch_Name && m.__BDFDB_ContextMenuWrapper_Patch_Name.endsWith("ContextMenu") && `${InternalData.ModuleUtilsConfig.ContextMenuTypes.find(t => m.__BDFDB_ContextMenuWrapper_Patch_Name.indexOf(t) > -1)}ContextMenu` == type) {
							m.__BDFDB_ContextMenu_Patch_Name = type;
							return true;
						}
					};
					else PluginStores.contextChunkObserver[type].filter = m => {
						if (!m || !(m.default || m.type)) return;
						const d = m.default || m.type;
						if (d.displayName && InternalData.ModuleUtilsConfig.ContextMenuSubItemsMap[mappedType].items.indexOf(d.displayName) > -1) {
							m.__BDFDB_ContextMenu_Patch_Name = d.displayName;
							return true;
						}
						else {
							const subType = InternalData.ModuleUtilsConfig.ContextMenuSubItemsMap[mappedType].items.find(item => InternalData.ModuleUtilsConfig.Finder[item] && InternalData.ModuleUtilsConfig.Finder[item].strings && Internal.hasModuleStrings(d, InternalData.ModuleUtilsConfig.Finder[item].strings));
							if (subType) {
								m.__BDFDB_ContextMenu_Patch_Name = subType;
								return true;
							}
						}
					};
					PluginStores.contextChunkObserver[type].modules = BDFDB.ModuleUtils.find(PluginStores.contextChunkObserver[type].filter, {useExport: false, all: true}).map(m => m.exports).filter(n => n);
				}
			}
			
			Internal.patchPlugin(BDFDB);
			Internal.addQueuePatches(BDFDB);
			Internal.addContextChunkObservers(BDFDB);
			
			if (InternalData.ModuleUtilsConfig.QueuedComponents) for (let type of InternalData.ModuleUtilsConfig.QueuedComponents) if (!PluginStores.patchQueues[type]) PluginStores.patchQueues[type] = {query: [], modules: []};
			
			let languageChangeTimeout;
			if (Internal.LibraryModules.SettingsUtilsOld) BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.SettingsUtilsOld, ["updateRemoteSettings", "updateLocalSettings"], {after: e => {
				if (e.methodArguments[0] && e.methodArguments[0].locale) {
					BDFDB.TimeUtils.clear(languageChangeTimeout);
					languageChangeTimeout = BDFDB.TimeUtils.timeout(_ => {
						for (let pluginName in PluginStores.loaded) if (PluginStores.loaded[pluginName].started) BDFDB.PluginUtils.translate(PluginStores.loaded[pluginName]);
					}, 10000);
				}
			}});
			
			Internal.onSettingsClosed = function () {
				if (Internal.SettingsUpdated) {
					delete Internal.SettingsUpdated;
					Internal.forceUpdateAll();
				}
			};
			
			Internal.forceUpdateAll = function () {					
				BDFDB.MessageUtils.rerenderAll();
				BDFDB.PatchUtils.forceAllUpdates(BDFDB);
			};
			
			if (Internal.LibraryComponents.GuildComponents.BlobMask) {
				let newBadges = ["lowerLeftBadge", "upperLeftBadge"];
				BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryComponents.GuildComponents.BlobMask.prototype, "render", {
					before: e => {
						e.thisObject.props = Object.assign({}, Internal.LibraryComponents.GuildComponents.BlobMask.defaultProps, e.thisObject.props);
						for (let type of newBadges) if (!e.thisObject.state[`${type}Mask`]) e.thisObject.state[`${type}Mask`] = new Internal.LibraryComponents.Animations.Controller({spring: 0});
					},
					after: e => {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnValue, {name: "TransitionGroup"});
						if (index > -1) {
							children[index].props.children.push(!e.thisObject.props.lowerLeftBadge ? null : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.BadgeAnimationContainer, {
								className: BDFDB.disCN.guildlowerleftbadge,
								key: "lower-left-badge",
								animatedStyle: e.thisObject.getLowerLeftBadgeStyles(),
								children: e.thisObject.props.lowerLeftBadge
							}));
							children[index].props.children.push(!e.thisObject.props.upperLeftBadge ? null : BDFDB.ReactUtils.createElement(Internal.LibraryComponents.BadgeAnimationContainer, {
								className: BDFDB.disCN.guildupperleftbadge,
								key: "upper-left-badge",
								animatedStyle: e.thisObject.getUpperLeftBadgeStyles(),
								children: e.thisObject.props.upperLeftBadge
							}));
						}
						[children, index] = BDFDB.ReactUtils.findParent(e.returnValue, {name: "mask"});
						if (index > -1) {
							children[index].props.children.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.rect, {
								x: -4,
								y: -4,
								width: e.thisObject.props.upperLeftBadgeWidth + 8,
								height: 24,
								rx: 12,
								ry: 12,
								transform: e.thisObject.getLeftBadgePositionInterpolation(e.thisObject.state.upperLeftBadgeMask, -1),
								fill: "black"
							}));
							children[index].props.children.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Animations.animated.rect, {
								x: -4,
								y: 28,
								width: e.thisObject.props.lowerLeftBadgeWidth + 8,
								height: 24,
								rx: 12,
								ry: 12,
								transform: e.thisObject.getLeftBadgePositionInterpolation(e.thisObject.state.lowerLeftBadgeMask),
								fill: "black"
							}));
						}
					}
				});
				BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryComponents.GuildComponents.BlobMask.prototype, "componentDidMount", {
					after: e => {
						for (let type of newBadges) e.thisObject.state[`${type}Mask`].update({
							spring: e.thisObject.props[type] != null ? 1 : 0,
							immediate: true
						}).start();
					}
				});
				BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryComponents.GuildComponents.BlobMask.prototype, "componentWillUnmount", {
					after: e => {
						for (let type of newBadges) if (e.thisObject.state[`${type}Mask`]) e.thisObject.state[`${type}Mask`].dispose();
					}
				});
				BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryComponents.GuildComponents.BlobMask.prototype, "componentDidUpdate", {
					after: e => {
						for (let type of newBadges) if (e.thisObject.props[type] != null && e.methodArguments[0][type] == null) {
							e.thisObject.state[`${type}Mask`].update({
								spring: 1,
								immediate: !document.hasFocus(),
								config: {friction: 30, tension: 900, mass: 1}
							}).start();
						}
						else if (e.thisObject.props[type] == null && e.methodArguments[0][type] != null) {
							e.thisObject.state[`${type}Mask`].update({
								spring: 0,
								immediate: !document.hasFocus(),
								config: {duration: 150, friction: 10, tension: 100, mass: 1}
							}).start();
						}
					}
				});
				Internal.LibraryComponents.GuildComponents.BlobMask.prototype.getLeftBadgePositionInterpolation = function (e, t) {
					return void 0 === t && (t = 1), e.springs.spring.to([0, 1], [20, 0]).to(function (e) {
						return "translate(" + e * -1 + " " + e * t + ")";
					});
				};
				Internal.LibraryComponents.GuildComponents.BlobMask.prototype.getLowerLeftBadgeStyles = function () {
					var e = this.state.lowerLeftBadgeMask.springs.spring;
					return {
						opacity: e.to([0, .5, 1], [0, 0, 1]),
						transform: e.to(function (e) {
							return "translate(" + -1 * (16 - 16 * e) + "px, " + (16 - 16 * e) + "px)";
						})
					};
				};
				Internal.LibraryComponents.GuildComponents.BlobMask.prototype.getUpperLeftBadgeStyles = function () {
					var e = this.state.upperLeftBadgeMask.springs.spring;
					return {
						opacity: e.to([0, .5, 1], [0, 0, 1]),
						transform: e.to(function (e) {
							return "translate(" + -1 * (16 - 16 * e) + "px, " + -1 * (16 - 16 * e) + "px)";
						})
					};
				};
				let extraDefaultProps = {};
				for (let type of newBadges) extraDefaultProps[`${type}Width`] = 16;
				Internal.setDefaultProps(Internal.LibraryComponents.GuildComponents.BlobMask, extraDefaultProps);
			}
			
			BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.GuildStore, "getGuild", {after: e => {
				if (e.returnValue && e.methodArguments[0] == InternalData.myGuildId) e.returnValue.banner = `https://mwittrien.github.io/BetterDiscordAddons/Library/_res/BDFDB.banner.png`;
			}});
			
			BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.UserStore, "getUser", {after: e => {
				if (e.returnValue && e.methodArguments[0] == InternalData.myId) e.returnValue.banner = `https://mwittrien.github.io/BetterDiscordAddons/Library/_res/DevilBro.banner.png`;
			}});

			BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.IconUtils, "getGuildBannerURL", {instead: e => {
				return e.methodArguments[0].id == InternalData.myGuildId ? e.methodArguments[0].banner : e.callOriginalMethod();
			}});

			BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.IconUtils, "getUserBannerURL", {instead: e => {
				return e.methodArguments[0].id == InternalData.myId ? e.methodArguments[0].banner : e.callOriginalMethod();
			}});
			
			BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.BannerUtils, "getUserBannerURLForContext", {instead: e => {
				return e.methodArguments[0].user && e.methodArguments[0].user.id == InternalData.myId ? e.methodArguments[0].user.banner : e.callOriginalMethod();
			}});
			
			BDFDB.PatchUtils.patch(BDFDB, Internal.LibraryModules.EmojiStateUtils, "getEmojiUnavailableReason", {after: e => {
				if (Internal.LibraryComponents.EmojiPickerButton.current && Internal.LibraryComponents.EmojiPickerButton.current.props && Internal.LibraryComponents.EmojiPickerButton.current.props.allowManagedEmojisUsage) return null;
			}});
			
			Internal.forceUpdateAll();
		
			const pluginQueue = window.BDFDB_Global && BDFDB.ArrayUtils.is(window.BDFDB_Global.pluginQueue) ? window.BDFDB_Global.pluginQueue : [];

			if (BDFDB.UserUtils.me.id == InternalData.myId || BDFDB.UserUtils.me.id == "350635509275557888") {
				BDFDB.DevUtils = {};
				BDFDB.DevUtils.generateClassId = Internal.generateClassId;
				BDFDB.DevUtils.findByIndex = function (index) {
					return BDFDB.DevUtils.req.c[index];
				};
				BDFDB.DevUtils.findPropAny = function (...strings) {
					window.t = {"$filter":(prop => [...strings].flat(10).filter(n => typeof n == "string").every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j)) window.t[j + "_" + i] = m;
						if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j)) window.t[j + "_default_" + i] = m.default;
					}
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.findPropFunc = function (...strings) {
					window.t = {"$filter":(prop => [...strings].flat(10).filter(n => typeof n == "string").every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j) && typeof m[j] != "string") window.t[j + "_" + i] = m;
						if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j) && typeof m.default[j] != "string") window.t[j + "_default_" + i] = m.default;
					}
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.findPropStringLib = function (...strings) {
					window.t = {"$filter":(prop => [...strings].flat(10).filter(n => typeof n == "string").every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j) && typeof m[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m[j])) window.t[j + "_" + i] = m;
						if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j) && typeof m.default[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m.default[j])) window.t[j + "_default_" + i] = m.default;
					}
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.findNameAny = function (...strings) {
					window.t = {"$filter":(m => [...strings].flat(10).filter(n => typeof n == "string").some(string => typeof m.displayName == "string" && m.displayName.toLowerCase().indexOf(string.toLowerCase()) > -1 || m.name == "string" && m.name.toLowerCase().indexOf(string.toLowerCase()) > -1))};
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && (typeof m == "object" || typeof m == "function") && window.t.$filter(m)) window.t[(m.displayName || m.name) + "_" + i] = m;
						if (m && (typeof m == "object" || typeof m == "function") && m.default && (typeof m.default == "object" || typeof m.default == "function") && window.t.$filter(m.default)) window.t[(m.default.displayName || m.default.name) + "_" + i] = m.default;
					}
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.findCodeAny = function (...strings) {
					window.t = {"$filter":(m => Internal.hasModuleStrings(m, strings, true))};
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && typeof m == "function" && window.t.$filter(m)) window.t["module_" + i] = {string: m.toString(), func: m};
						if (m && m.__esModule) {
							for (let j in m) if (m[j] && typeof m[j] == "function" && window.t.$filter(m[j])) window.t[j + "_module_" + i] = {string: m[j].toString(), func: m[j], module: m};
							if (m.default && (typeof m.default == "object" || typeof m.default == "function")) for (let j in m.default) if (m.default[j] && typeof m.default[j] == "function" && window.t.$filter(m.default[j])) window.t[j + "_module_" + i + "_default"] = {string: m.default[j].toString(), func: m.default[j], module: m};
						}
					}
					for (let i in BDFDB.DevUtils.req.m) if (typeof BDFDB.DevUtils.req.m[i] == "function" && window.t.$filter(BDFDB.DevUtils.req.m[i])) window.t["function_" + i] = {string: BDFDB.DevUtils.req.m[i].toString(), func: BDFDB.DevUtils.req.m[i]};
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.getAllModules = function () {
					window.t = {};
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && typeof m == "object") window.t[i] = m;
					}
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.getAllStringLibs = function () {
					window.t = [];
					for (let i in BDFDB.DevUtils.req.c) if (BDFDB.DevUtils.req.c.hasOwnProperty(i)) {
						let m = BDFDB.DevUtils.req.c[i].exports;
						if (m && typeof m == "object" && !BDFDB.ArrayUtils.is(m) && Object.keys(m).length) {
							var string = true, stringlib = false;
							for (let j in m) {
								if (typeof m[j] != "string") string = false;
								if (typeof m[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m[j])) stringlib = true;
							}
							if (string && stringlib) window.t.push(m);
						}
						if (m && typeof m == "object" && m.default && typeof m.default == "object" && !BDFDB.ArrayUtils.is(m.default) && Object.keys(m.default).length) {
							var string = true, stringlib = false;
							for (let j in m.default) {
								if (typeof m.default[j] != "string") string = false;
								if (typeof m.default[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m.default[j])) stringlib = true;
							}
							if (string && stringlib) window.t.push(m.default);
						}
					}
					console.clear();
					console.log(window.t);
				};
				BDFDB.DevUtils.listen = function (strings) {
					strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
					BDFDB.DevUtils.listenStop();
					BDFDB.DevUtils.listen.p = BDFDB.PatchUtils.patch("WebpackSearch", BDFDB.ModuleUtils.findByProperties(strings), strings[0], {after: e => {
						console.log(e);
					}});
				};
				BDFDB.DevUtils.listenStop = function () {
					if (typeof BDFDB.DevUtils.listen.p == "function") BDFDB.DevUtils.listen.p();
				};
				BDFDB.DevUtils.generateLanguageStrings = function (strings, config = {}) {
					const language = config.language || "en";
					const languages = BDFDB.ArrayUtils.removeCopies(BDFDB.ArrayUtils.is(config.languages) ? config.languages : ["en"].concat((Internal.LibraryModules.LanguageStore.languages || Internal.LibraryModules.LanguageStore._languages).filter(n => n.enabled).map(n => {
						if (BDFDB.LanguageUtils.languages[n.code]) return n.code;
						else {
							const code = n.code.split("-")[0];
							if (BDFDB.LanguageUtils.languages[code]) return code;
						}
					})).filter(n => n && !n.startsWith("en-") && !n.startsWith("$") && n != language)).sort();
					let translations = {};
					strings = BDFDB.ObjectUtils.sort(strings);
					const stringKeys = Object.keys(strings);
					translations[language] = BDFDB.ObjectUtils.toArray(strings);
					let text = Object.keys(translations[language]).map(k => translations[language][k]).join("\n\n");
					
					let fails = 0, next = lang => {
						if (!lang) {
							let formatTranslation = (l, s, i) => {
								l = l == "en" ? "default" : l;
								return config.cached && config.cached[l] && config.cached[l][stringKeys[i]] || (translations[language][i][0] == translations[language][i][0].toUpperCase() ? Internal.LibraryModules.StringUtils.upperCaseFirstChar(s) : s);
							};
							let format = config.asObject ? ((l, isNotFirst) => {
								return `${isNotFirst ? "," : ""}\n\t\t"${l == "en" ? "default" : l}": {${translations[l].map((s, i) => `\n\t\t\t"${stringKeys[i]}": "${formatTranslation(l, s, i)}"`).join(",")}\n\t\t}`;
							}) : ((l, isNotFirst) => {
								return `\n\t\t\t\t\t${l == "en" ? "default" : `case "${l}"`}:${l.length > 2 ? "\t" : "\t\t"}// ${BDFDB.LanguageUtils.languages[l].name}\n\t\t\t\t\t\treturn {${translations[l].map((s, i) => `\n\t\t\t\t\t\t\t${stringKeys[i]}:${"\t".repeat(10 - ((stringKeys[i].length + 2) / 4))}"${formatTranslation(l, s, i)}"`).join(",")}\n\t\t\t\t\t\t};`;
							});
							let result = Object.keys(translations).filter(n => n != "en").sort().map((l, i) => format(l, i)).join("");
							if (translations.en) result += format("en", result ? 1 : 0);
							BDFDB.NotificationUtils.toast("Translation copied to clipboard", {
								type: "success"
							});
							Internal.LibraryRequires.electron.clipboard.write({text: result});
						}
						else {
							const callback = translation => {
								BDFDB.LogUtils.log(lang);
								if (!translation) {
									console.warn("No Translation");
									fails++;
									if (fails > 10) console.error("Skipped Language");
									else languages.unshift(lang);
								}
								else {
									fails = 0;
									translations[lang] = translation.split("\n\n");
								}
								next(languages.shift());
							};
							Internal.LibraryRequires.request(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${language}&tl=${lang}&dt=t&dj=1&source=input&q=${encodeURIComponent(text)}`, (error, response, result) => {
								if (!error && result && response.statusCode == 200) {
									try {callback(JSON.parse(result).sentences.map(n => n && n.trans).filter(n => n).join(""));}
									catch (err) {callback("");}
								}
								else {
									if (response.statusCode == 429) {
										BDFDB.NotificationUtils.toast("Too many Requests", {
											type: "danger"
										});
									}
									else {
										BDFDB.NotificationUtils.toast("Failed to translate Text", {
											type: "danger"
										});
										callback("");
									}
								}
							});
						}
					};
					if (stringKeys.length) next(languages.shift());
				};
				BDFDB.DevUtils.req = Internal.getWebModuleReq();
				
				window.BDFDB = BDFDB;
			}
			
			window.BDFDB = BDFDB;
			
			if (libraryCSS) BDFDB.DOMUtils.appendLocalStyle("BDFDB", libraryCSS.replace(/[\n\t\r]/g, "").replace(/\[REPLACE_CLASS_([A-z0-9_]+?)\]/g, (a, b) => BDFDB.dotCN[b]));
		
			BDFDB.LogUtils.log("Finished loading Library");
			
			window.BDFDB_Global = Object.assign({
				started: true,
				loaded: true,
				PluginUtils: {
					buildPlugin: BDFDB.PluginUtils.buildPlugin,
					cleanUp: BDFDB.PluginUtils.cleanUp
				}
			}, config);
			
			while (PluginStores.delayed.loads.length) PluginStores.delayed.loads.shift().load();
			while (PluginStores.delayed.starts.length) PluginStores.delayed.starts.shift().start();
			while (pluginQueue.length) {
				let pluginName = pluginQueue.shift();
				if (pluginName) BDFDB.TimeUtils.timeout(_ => BDFDB.BDUtils.reloadPlugin(pluginName));
			}
		};
		
		const alreadyLoadedComponents = [];
		if (InternalData.ForceLoadedComponents) {
			let promises = [];
			for (let name in InternalData.ForceLoadedComponents) {
				let parentModule;
				if (InternalData.ForceLoadedComponents[name].name) {
					if (InternalData.ForceLoadedComponents[name].protos) parentModule = BDFDB.ModuleUtils.find(m => m && m.displayName == InternalData.ForceLoadedComponents[name].name && m.prototype && InternalData.ForceLoadedComponents[name].protos.every(proto => m.prototype[proto]) && m, {useExport: false});
					else parentModule = BDFDB.ModuleUtils.findByName(InternalData.ForceLoadedComponents[name].name, false, true);
				}
				else if (InternalData.ForceLoadedComponents[name].props) parentModule = BDFDB.ModuleUtils.findByProperties(InternalData.ForceLoadedComponents[name].props, false, true);
				if (parentModule && parentModule.exports && alreadyLoadedComponents.indexOf(parentModule.id) > -1) {
					alreadyLoadedComponents.push(parentModule.id);
					promises.push(Internal.lazyLoadModuleImports(parentModule.exports));
				}
			}
			Promise.all(promises).then(loadComponents);
		}
		else loadComponents();
	};
	requestLibraryHashes(true);
	
	return class BDFDB_Frame {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load () {
			this.loaded = true;
			libraryInstance = this;
			Object.assign(this, config.info, BDFDB.ObjectUtils.exclude(config, "info"));
			if (!BDFDB.BDUtils.isPluginEnabled(config.info.name)) BDFDB.BDUtils.enablePlugin(config.info.name);
		}
		start () {
			if (!this.loaded) this.load();
		}
		stop () {
			if (!BDFDB.BDUtils.isPluginEnabled(config.info.name)) BDFDB.BDUtils.enablePlugin(config.info.name);
		}
		
		getSettingsPanel (collapseStates = {}) {
			let settingsPanel;
			let getString = (type, key, property) => {
				return BDFDB.LanguageUtils.LibraryStringsCheck[`settings_${key}_${property}`] ? BDFDB.LanguageUtils.LibraryStringsFormat(`settings_${key}_${property}`, BDFDB.BDUtils.getSettingsProperty("name", BDFDB.BDUtils.settingsIds[key]) || Internal.LibraryModules.StringUtils.upperCaseFirstChar(key.replace(/([A-Z])/g, " $1"))) : Internal.defaults[type][key][property];
			};
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(BDFDB, {
				collapseStates: collapseStates,
				children: _ => {
					let settingsItems = [];
					
					for (let key in Internal.settings.choices) settingsItems.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsSaveItem, {
						type: "Select",
						plugin: Internal,
						keys: ["choices", key],
						label: getString("choices", key, "description"),
						note: getString("choices", key, "note"),
						basis: "50%",
						value: Internal.settings.choices[key],
						options: Object.keys(LibraryConstants[Internal.defaults.choices[key].items] || {}).map(p => ({
							value: p,
							label: BDFDB.LanguageUtils.LibraryStrings[p] || p
						})),
						searchable: true
					}));
					for (let key in Internal.settings.general) {
						let nativeSetting = BDFDB.BDUtils.settingsIds[key] && BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds[key]);
						let disabled = typeof Internal.defaults.general[key].isDisabled == "function" && Internal.defaults.general[key].isDisabled({
							value: Internal.settings.general[key],
							nativeValue: nativeSetting
						});
						let hidden = typeof Internal.defaults.general[key].isHidden == "function" && Internal.defaults.general[key].isHidden({
							value: Internal.settings.general[key],
							nativeValue: nativeSetting
						});
						if (!hidden) settingsItems.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: Internal,
							disabled: disabled,
							keys: ["general", key],
							label: getString("general", key, "description"),
							note: (typeof Internal.defaults.general[key].hasNote == "function" ? Internal.defaults.general[key].hasNote({
								value: Internal.settings.general[key],
								nativeValue: nativeSetting,
								disabled: disabled
							}) : Internal.defaults.general[key].hasNote) && getString("general", key, "note"),
							value: (typeof Internal.defaults.general[key].getValue == "function" ? Internal.defaults.general[key].getValue({
								value: Internal.settings.general[key],
								nativeValue: nativeSetting,
								disabled: disabled
							}) : true) && (Internal.settings.general[key] || nativeSetting),
							onChange: typeof Internal.defaults.general[key].onChange == "function" ? Internal.defaults.general[key].onChange : (_ => {})
						}));
					}
					settingsItems.push(BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SettingsItem, {
						type: "Button",
						label: BDFDB.LanguageUtils.LibraryStrings.update_check_info,
						dividerTop: true,
						basis: "20%",
						children: BDFDB.LanguageUtils.LibraryStrings.check_for_updates,
						labelChildren: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.Clickable, {
							children: BDFDB.ReactUtils.createElement(Internal.LibraryComponents.SvgIcon, {
								name: Internal.LibraryComponents.SvgIcon.Names.QUESTIONMARK,
								width: 20,
								height: 20,
								onClick: _ => BDFDB.ModalUtils.open(Internal, {
									header: "Plugins",
									subHeader: "",
									contentClassName: BDFDB.disCN.marginbottom20,
									text: BDFDB.ObjectUtils.toArray(Object.assign({}, window.PluginUpdates && window.PluginUpdates.plugins, PluginStores.updateData.plugins)).map(p => p.name).filter(n => n).sort().join(", ")
								})
							})
						}),
						onClick: _ => {
							let loadingString = `${BDFDB.LanguageUtils.LanguageStrings.CHECKING_FOR_UPDATES} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`;
							let currentLoadingString = loadingString;
							let toastInterval, toast = BDFDB.NotificationUtils.toast(loadingString, {
								type: "info",
								timeout: 0,
								onClose: _ => BDFDB.TimeUtils.clear(toastInterval)
							});
							toastInterval = BDFDB.TimeUtils.interval(_ => {
								currentLoadingString = currentLoadingString.endsWith(".....") ? loadingString : currentLoadingString + ".";
								toast.update(currentLoadingString);
							}, 500);
							BDFDB.PluginUtils.checkAllUpdates().then(outdated => {
								toast.close();
								if (outdated > 0) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("update_check_complete_outdated", outdated), {
									type: "danger"
								});
								else BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStrings.update_check_complete, {
									type: "success"
								});
							});
						}
					}));
					
					return settingsItems;
				}
			});
		}
	}
})();
