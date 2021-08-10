(_ => {
	let DiscordClassModules, DiscordClasses, userId;
	
	window.global = window;
	
	const nativeRequire = window.require || (_ => {});
	const nativeWebpackJsonp = window.webpackJsonp;
	const getWindow = _ => {
		let electron = nativeRequire("electron");
		if (electron && electron.remote) {
			let browserWindow = electron.remote.getCurrentWindow();
			if (browserWindow) return browserWindow;
		}
	};
	const respondToParent = (data = {}) => {
		if (window.parent && typeof window.parent.postMessage == "function") window.parent.postMessage(data, "*");
		if (data.hostId != null && data.hostName != null) {
			let ipcRenderer = (nativeRequire("electron") || {}).ipcRenderer;
			if (ipcRenderer && typeof ipcRenderer.sendTo == "function") ipcRenderer.sendTo(data.hostId, data.hostName, data);
		}
	};

	window.onload = function () {
		respondToParent({
			origin: "DiscordPreview",
			reason: "OnLoad"
		});
	};
	window.onkeyup = function (e) {
		respondToParent({
			origin: "DiscordPreview",
			reason: "KeyUp",
			which: e.which
		});
	};
	window.onmessage = function (e) {
		let data = e.data || e;
		if (typeof data === "object" && (data.origin == "PluginRepo" || data.origin == "ThemeRepo")) {
			switch (data.reason) {
				case "OnLoad":
					document.body.innerHTML = document.body.innerHTML.replace(/\t|\n|\r/g, "");
					
					if (data.username) {
						document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERNAMESMALL/gi, data.username.toLowerCase());
						document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERNAME/gi, data.username);
					}
					if (data.id) {
						userId = data.id;
						document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERID/gi, data.id);
					}
					if (data.avatar) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_AVATAR/gi, data.avatar.split('"').join('') + "?size=");
					if (data.discriminator) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_DISCRIMINATOR/gi, data.discriminator);
					if (data.classes) DiscordClasses = JSON.parse(data.classes);
					if (data.classModules) DiscordClassModules = JSON.parse(data.classModules);
					
					if (disCN != undefined && DiscordClasses != undefined && DiscordClassModules != undefined) {
						let oldHTML = document.body.innerHTML.split("REPLACE_CLASS_");
						let newHTML = oldHTML.shift();
						for (let html of oldHTML) {
							let reg = /([A-z0-9_]+)(.+)/.exec(html);
							newHTML += disCN[reg[1]] + reg[2];
						}
						document.body.innerHTML = newHTML;
					}
					
					if (data.nativeCSS) {
						let theme = document.createElement("style");
						theme.innerText = data.nativeCSS;
						document.head.appendChild(theme);
					}
					
					if (data.bdCSS) {
						let theme = document.createElement("style");
						theme.innerText = data.bdCSS;
						document.head.appendChild(theme);
					}
					
					if (data.htmlClassName) document.documentElement.className = data.htmlClassName;
					if (window.parent && typeof window.parent.postMessage == "function") document.documentElement.classList.add("iframe-mode");
					document.documentElement.classList.add("app-focused");
					document.documentElement.classList.add("mouse-mode");
					document.documentElement.classList.add("full-motion");
					
					if (data.titleBar) document.querySelector(".preview-titlebar").outerHTML = data.titleBar;
					
					document.body.firstElementChild.style.removeProperty("display");
					document.addEventListener("click", event => {
						let button = getParent(dotCNC.titlebarmacbutton + dotCN.titlebarwinbutton, event.target);
						if (button) {
							let browserWindow = getWindow();
							if (button.className.indexOf(disCN.titlebarmacbuttonclose) > -1 || button.className.indexOf(disCN.titlebarwinbuttonclose) > -1) {
								if (browserWindow) browserWindow.close();
								respondToParent({
									origin: "DiscordPreview",
									reason: "close"
								});
							}
							else if (button.className.indexOf(disCN.titlebarmacbuttonmax) > -1 || (button.className.indexOf(disCN.titlebarwinbuttonminmax) > -1 && button.parentElement.lastElementChild != button)) {
								if (browserWindow) {
									if (browserWindow.isMaximized()) browserWindow.unmaximize();
									else browserWindow.maximize();
								}
								respondToParent({
									origin: "DiscordPreview",
									reason: "maximize"
								});
							}
							else if (button.className.indexOf(disCN.titlebarmacbuttonmin) > -1 || (button.className.indexOf(disCN.titlebarwinbuttonminmax) > -1 && button.parentElement.lastElementChild == button)) {
								if (browserWindow) browserWindow.minimize();
								respondToParent({
									origin: "DiscordPreview",
									reason: "minimize"
								});
							}
						}
					});
					break;
				case "NewTheme":
				case "CustomCSS":
				case "ThemeFixer":
					document.querySelectorAll("style." + data.reason).forEach(theme => theme.remove());
					if (data.checked) {
						let theme = document.createElement("style");
						theme.classList.add(data.reason);
						theme.innerText = data.css;
						document.head.appendChild(theme);
					}
					break;
				case "DarkLight":
					if (data.checked) {
						document.documentElement.className = document.documentElement.className.replace(new RegExp(disCN.themedark, "g"), disCN.themelight);
						document.body.innerHTML = document.body.innerHTML.replace(new RegExp(disCN.themedark, "g"), disCN.themelight);
					}
					else {
						document.documentElement.className = document.documentElement.className.replace(new RegExp(disCN.themelight, "g"), disCN.themedark);
						document.body.innerHTML = document.body.innerHTML.replace(new RegExp(disCN.themelight, "g"), disCN.themedark);
					}
					break;
				case "Normalize":
					let oldHTML2 = document.body.innerHTML.split('class="');
					let newHTML2 = oldHTML2.shift();
					for (let html of oldHTML2) {
						html = html.split('"');
						newHTML2 += 'class="' + (data.checked ? html[0].split(" ").map(n => n.replace(/([A-z0-9]+?)-([A-z0-9_-]{6})/g, "$1-$2 da-$1")).join(" ") : html[0].split(" ").filter(n => n.indexOf("da-") != 0).join(" ")) + '"' + html.slice(1).join('"');
					}
					document.body.innerHTML = newHTML2;
					break;
			}
		}
	};
	let disCN = new Proxy({}, {
		get: function (list, item) {
			return getDiscordClass(item, false).replace("#", "");
		}
	});
	let disCNS = new Proxy({}, {
		get: function (list, item) {
			return getDiscordClass(item, false).replace("#", "") + " ";
		}
	});
	let disCNC = new Proxy({}, {
		get: function (list, item) {
			return getDiscordClass(item, false).replace("#", "") + ",";
		}
	});
	let dotCN = new Proxy({}, {
		get: function (list, item) {
			let className = getDiscordClass(item, true);
			return (className.indexOf("#") == 0 ? "" : ".") + className;
		}
	});
	let dotCNS = new Proxy({}, {
		get: function (list, item) {
			let className = getDiscordClass(item, true);
			return (className.indexOf("#") == 0 ? "" : ".") + className + " ";
		}
	});
	let dotCNC = new Proxy({}, {
		get: function (list, item) {
			let className = getDiscordClass(item, true);
			return (className.indexOf("#") == 0 ? "" : ".") + className + ",";
		}
	});
	let notCN = new Proxy({}, {
		get: function (list, item) {
			return `:not(.${getDiscordClass(item, true).split(".")[0]})`;
		}
	});
	let notCNS = new Proxy({}, {
		get: function (list, item) {
			return `:not(.${getDiscordClass(item, true).split(".")[0]}) `;
		}
	});
	let notCNC = new Proxy({}, {
		get: function (list, item) {
			return `:not(.${getDiscordClass(item, true).split(".")[0]}),`;
		}
	});
	let getDiscordClass = function (item, selector) {
		let className = fallbackClassName = "Preview_undefined";
		if (DiscordClasses[item] === undefined) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color: #3a71c1; font-weight: 700;', '', item + ' not found in DiscordClasses');
			return className;
		} 
		else if (!Array.isArray(DiscordClasses[item]) || DiscordClasses[item].length != 2) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color: #3a71c1; font-weight: 700;', '', item + ' is not an Array of Length 2 in DiscordClasses');
			return className;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]] === undefined) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color: #3a71c1; font-weight: 700;', '', DiscordClasses[item][0] + ' not found in DiscordClassModules');
			return className;
		}
		else if ([DiscordClasses[item][1]].flat().every(prop => DiscordClassModules[DiscordClasses[item][0]][prop] === undefined)) {
			if (userId == "278543574059057154") console.warn(`%c[Preview]%c`, 'color: #3a71c1; font-weight: 700;', '', DiscordClasses[item][1] + ' not found in ' + DiscordClasses[item][0] + ' in DiscordClassModules');
			return className;
		}
		else {
			for (let prop of [DiscordClasses[item][1]].flat()) {
				className = DiscordClassModules[DiscordClasses[item][0]][prop];
				if (className) break;
				else className = fallbackClassName;
			}
			className = DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]];
			if (selector) {
				className = className.split(" ").filter(n => n.indexOf("da-") != 0).join(selector ? "." : " ");
				className = className || fallbackClassName;
			}
			return className || fallbackClassName;
		}
	};
	
	let getParent = function (listOrSelector, node) {
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
	
	window.require = function () {
		return _ => {};
	};
	
	window.getString = function (obj) {
		let string = "";
		if (typeof obj == "string") string = obj;
		else if (obj && obj.props) {
			if (typeof obj.props.children == "string") string = obj.props.children;
			else if (Array.isArray(obj.props.children)) for (let c of obj.props.children) string += typeof c == "string" ? c : getString(c);
		}
		return string;
	};

	window.webpackJsonp = {
		push: _ => ({
			m: {},
			c: {}
		})
	};
	
	window.fetch = function () {
		return new Promise(_ => {});
	};
	
	let XMLHttpRequestProto = XMLHttpRequest.prototype;
	window.XMLHttpRequest = class {};
	for (let key of Object.keys(XMLHttpRequestProto)) try {
		if (typeof XMLHttpRequestProto[key] == "function") window.XMLHttpRequest.prototype[key] = _ => {return new Promise(_ => {});};
	} catch(err) {}
	
	let WebModulesFind = function (filter) {
		const id = "PluginRepo-WebModules";
		const req = nativeWebpackJsonp.push([[], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
		delete req.m[id];
		delete req.c[id];
		for (let m in req.c) {
			if (req.c.hasOwnProperty(m)) {
				var module = req.c[m].exports;
				if (module && module.__esModule && module.default && filter(module.default)) return module.default;
				if (module && filter(module)) return module;
			}
		}
	};
	let WebModulesFindByProperties = function (properties) {
		properties = Array.isArray(properties) ? properties : Array.from(arguments);
		let module = WebModulesFind(module => properties.every(prop => module[prop] !== undefined));
		if (!module) {
			module = {};
			for (let property of properties) module[property] = property;
		}
		return module;
	};
	let WebModulesFindByName = function (name) {
		return WebModulesFind(module => module.displayName === name) || "";
	};
	
	window.BDV2 = {};
	window.BDV2.react = window.React;
	window.BDV2.reactDom = window.ReactDOM;
	window.BDV2.WebpackModules = {};
	window.BDV2.WebpackModules.find = WebModulesFind;
	window.BDV2.WebpackModules.findByUniqueProperties = WebModulesFindByProperties;
	window.BDV2.WebpackModules.findByDisplayName = WebModulesFindByName;

	window.BdApi = {};
	window.BdApi.getData = _ => ({});
	window.BdApi.loadData = _ => ({});
	window.BdApi.saveData = _ => {};
	window.BdApi.React = window.React;
	window.BdApi.ReactDOM = window.ReactDOM;
	window.BdApi.findModule = WebModulesFind;
	window.BdApi.findModuleByProps = WebModulesFindByProperties;
	window.BdApi.findModuleByDisplayName = WebModulesFindByName;
})();
