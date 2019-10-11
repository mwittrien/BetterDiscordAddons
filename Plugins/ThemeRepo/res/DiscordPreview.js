window.global = window;

window.onload = function () {
	window.parent.postMessage({origin:"DiscordPreview",reason:"OnLoad"},"*");
};
window.onkeyup = function (e) {
	var which = e.which;
	window.parent.postMessage({origin:"DiscordPreview",reason:"KeyUp",which},"*");
};
window.onmessage = function (e) {
	if (typeof e.data === "object" && (e.data.origin == "PluginRepo" || e.data.origin == "ThemeRepo")) {
		switch (e.data.reason) {
			case "OnLoad":
				document.body.innerHTML = document.body.innerHTML.replace(/\t|\n|\r/g, "");
				if (e.data.classes) window.DiscordClasses = JSON.parse(e.data.classes);
				if (e.data.classmodules) window.DiscordClassModules = JSON.parse(e.data.classmodules);
				if (window.disCN != undefined && window.DiscordClasses != undefined && window.DiscordClassModules != undefined) {
					var oldhtml = document.body.innerHTML.split("REPLACE_CLASS_");
					var newhtml = oldhtml.shift();
					for (let html of oldhtml) {
						let reg = /([A-z0-9_]+)(.+)/.exec(html);
						newhtml += window.disCN[reg[1]] + reg[2];
					}
					document.body.innerHTML = newhtml;
				}
				if (e.data.username) {
					document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERNAMESMALL/gi, e.data.username.toLowerCase());
					document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERNAME/gi, e.data.username);
				}
				if (e.data.id) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_USERID/gi, e.data.id);
				if (e.data.avatar) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_AVATAR/gi, e.data.avatar.split('"').join('') + "?size=");
				if (e.data.discriminator) document.body.innerHTML = document.body.innerHTML.replace(/REPLACE_DISCRIMINATOR/gi, e.data.discriminator);
				if (e.data.nativecss) {
					var theme = document.createElement("link");
					theme.classList.add(e.data.reason);
					theme.rel = "stylesheet";
					theme.href = e.data.nativecss;
					document.head.appendChild(theme);
				}
				if (e.data.html) document.documentElement.className = e.data.html;
				if (e.data.titlebar) document.querySelector(".preview-titlebar").outerHTML = e.data.titlebar;
				document.body.firstElementChild.style.removeProperty("display");
				break;
			case "Eval":
				window.evalResult = null;
				if (e.data.jsstring) window.eval(`(() => {${e.data.jsstring}})()`);
				window.parent.postMessage({origin:"DiscordPreview",reason:"EvalResult",result:window.evalResult},"*");
				break;
			case "NewTheme":
			case "CustomCSS":
			case "ThemeFixer":
				document.querySelectorAll("style." + e.data.reason).forEach(theme => theme.remove());
				if (e.data.checked) {
					var theme = document.createElement("style");
					theme.classList.add(e.data.reason);
					theme.innerText = e.data.css;
					document.head.appendChild(theme);
				}
				break;
			case "DarkLight":
				if (e.data.checked) document.body.innerHTML = document.body.innerHTML.replace(new RegExp(window.disCN.themedark, "g"), window.disCN.themelight);
				else document.body.innerHTML = document.body.innerHTML.replace(new RegExp(window.disCN.themelight, "g"), window.disCN.themedark);
				break;
			case "Normalize":
				var oldhtml = document.body.innerHTML.split('class="');
				var newhtml = oldhtml.shift();
				for (let html of oldhtml) {
					html = html.split('"');
					newhtml += 'class="' + (e.data.checked ? html[0].replace(/([A-z0-9]+?)-([A-z0-9_-]{6})/g, "$1-$2 da-$1") : html[0].split(" ").filter(n => n.indexOf("da-") != 0).join(" ")) + '"' + html.slice(1).join('"');
				}
				document.body.innerHTML = newhtml;
				break;
		}
	}
};
window.require = function () {
	return () => {};
};
window.getString = function (obj) {
	var string = "";
	if (typeof obj == "string") string = obj;
	else if (obj && obj.props) {
		if (typeof obj.props.children == "string") string = obj.props.children;
		else if (Array.isArray(obj.props.children)) for (let c of obj.props.children) string += typeof c == "string" ? c : getString(c);
	}
	return string;
};
window.webpackJsonp = function () {
	return {default:{m:{},c:{}}};
};
window.WebModulesFind = function (filter) {
	const id = "PluginRepo-WebModules";
	const req = typeof(window.webpackJsonp) == "function" ? window.webpackJsonp([], {[id]: (module, exports, req) => exports.default = req}, [id]).default : window.webpackJsonp.push([[], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
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
window.WebModulesFindByProperties = function (properties) {
	properties = Array.isArray(properties) ? properties : Array.from(arguments);
	var module = WebModulesFind(module => properties.every(prop => module[prop] !== undefined));
	if (!module) {
		module = {};
		for (let property of properties) module[property] = property;
	}
	return module;
};
window.WebModulesFindByName = function (name) {
	return WebModulesFind(module => module.displayName === name) || "";
};
window.disCN = new Proxy({}, {
	get: function (list, item) {
		return window.getDiscordClass(item).replace('#', '');
	}
});
window.getDiscordClass = function (item) {
	var classname = "Preview_undefined";
	if (window.DiscordClasses === undefined || window.DiscordClassModules === undefined) return classname;
	else if (window.DiscordClasses[item] === undefined) {
		console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', item + ' not found in window.DiscordClasses');
		return classname;
	} 
	else if (!Array.isArray(window.DiscordClasses[item]) || window.DiscordClasses[item].length != 2) {
		console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', item + ' is not an Array of Length 2 in window.DiscordClasses');
		return classname;
	}
	else if (window.DiscordClassModules[window.DiscordClasses[item][0]] === undefined) {
		console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', window.DiscordClasses[item][0] + ' not found in DiscordClassModules');
		return classname;
	}
	else if (window.DiscordClassModules[window.DiscordClasses[item][0]][window.DiscordClasses[item][1]] === undefined) {
		console.warn(`%c[Preview]%c`, 'color:#3a71c1; font-weight:700;', '', window.DiscordClasses[item][1] + ' not found in ' + window.DiscordClasses[item][0] + ' in DiscordClassModules');
		return classname;
	}
	else return classname = window.DiscordClassModules[window.DiscordClasses[item][0]][window.DiscordClasses[item][1]];
};
window.BDV2 = {};
window.BDV2.react = window.React;
window.BDV2.reactDom = window.ReactDOM;
window.BDV2.WebpackModules = {};
window.BDV2.WebpackModules.find = window.WebModulesFind;
window.BDV2.WebpackModules.findByUniqueProperties = window.WebModulesFindByProperties;
window.BDV2.WebpackModules.findByDisplayName = window.WebModulesFindByName;
window.BdApi = {};
window.BdApi.React = window.React;
window.BdApi.ReactDOM = window.ReactDOM;
window.BdApi.findModule = window.WebModulesFind;
window.BdApi.findModuleByProps = window.WebModulesFindByProperties;