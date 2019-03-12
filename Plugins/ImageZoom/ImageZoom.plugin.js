//META{"name":"ImageZoom","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageZoom","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageZoom/ImageZoom.plugin.js"}*//

class ImageZoom {
	getName () {return "ImageZoom";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to zoom in opened Images by holding left clicking on them in the Image Modal.";}

	initConstructor () {
		this.patchModules = {
			"ImageModal":["componentDidMount","componentWillUnmount"]
		}

		this.zoomSettingsContextMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} imagezoom-contextmenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} zoomlevel-item ${BDFDB.disCN.contextmenuitemslider}">
						<div class="${BDFDB.disCN.contextmenulabel}"></div>
						<div class="${BDFDB.disCNS.contextmenuslider + BDFDB.disCNS.slider + BDFDB.disCN.slidermini}" digits=1 min=1 max=10 unit="x" type="zoomlevel" name="Zoom Level">
							<input type="number" class="${BDFDB.disCN.sliderinput}" readonly="" value="">
							<div class="${BDFDB.disCN.slidertrack}"></div>
							<div class="${BDFDB.disCN.sliderbar}">
								<div class="${BDFDB.disCN.sliderbarfill}"></div>
							</div>
							<div class="${BDFDB.disCN.slidertrack}">
								<div class="${BDFDB.disCN.slidergrabber}"></div>
							</div>
						</div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} lensesize-item ${BDFDB.disCN.contextmenuitemslider}">
						<div class="${BDFDB.disCN.contextmenulabel}"></div>
						<div class="${BDFDB.disCNS.contextmenuslider + BDFDB.disCNS.slider + BDFDB.disCN.slidermini}" digits=0 min=50 max=1000 unit="px" type="lensesize" name="Lense Size">
							<input type="number" class="${BDFDB.disCN.sliderinput}" readonly="" value="">
							<div class="${BDFDB.disCN.slidertrack}"></div>
							<div class="${BDFDB.disCN.sliderbar}">
								<div class="${BDFDB.disCN.sliderbarfill}"></div>
							</div>
							<div class="${BDFDB.disCN.slidertrack}">
								<div class="${BDFDB.disCN.slidergrabber}"></div>
							</div>
						</div>
					</div>
				</div>
			</div>`;

		this.css = `
			.imagezoom-lense {
				overflow: hidden !important;
				pointer-events: none !important;
				z-index: 10000 !important;
				position: absolute !important;
				border-radius: 50% !important;
				border: 2px solid rgb(114, 137, 218);
			}
			.imagezoom-backdrop {
				position: absolute !important;
				top: 0 !important;
				right: 0 !important;
				bottom: 0 !important;
				left: 0 !important;
				z-index: 8000 !important;
			}`;

		this.defaults = {
			settings: {
				zoomlevel:		{value:2},
				lensesize:		{value:200}
			}
		};
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this); 
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			for (let img of document.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) if (img.ImageZoomMouseDownListener) {
				img.removeEventListener("mousedown", img.ImageZoomMouseDownListener);
				delete img.ImageZoomMouseDownListener;
				img.removeAttribute("draggable");
			}
			
			BDFDB.removeEles(".imagezoom-contextmenu", ".imagezoom-separator", ".imagezoom-settings", ".imagezoom-lense", ".imagezoom-backdrop");
			
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processImageModal (instance, wrapper, methodnames) {
		if (methodnames.includes("componentDidMount")) {
			let modal = BDFDB.getParentEle(BDFDB.dotCN.modal, wrapper);
			if (!modal) return;
			let start = performance.now();
			let waitForImg = setInterval(() => {
				let img = modal.querySelector(BDFDB.dotCNS.imagewrapper + "img");
				if (img && img.src) {
					clearInterval(waitForImg);
					img.setAttribute("draggable", "false");
					img.parentElement.parentElement.appendChild(BDFDB.htmlToElement(`<span class="${BDFDB.disCN.downloadlink} imagezoom-separator" style="margin: 0px 5px;"> | </div>`));
					let settingslink = BDFDB.htmlToElement(`<span class="${BDFDB.disCN.downloadlink} imagezoom-settings">Zoom ${BDFDB.LanguageStrings.SETTINGS}</div>`);
					img.parentElement.parentElement.appendChild(settingslink);
					let openContext = e => {
						let settings = BDFDB.getAllData(this, "settings");
						let zoomSettingsContext = BDFDB.htmlToElement(this.zoomSettingsContextMarkup);
						for (let slideritem of zoomSettingsContext.querySelectorAll(BDFDB.dotCN.contextmenuitemslider)) {
							let slider = slideritem.querySelector(BDFDB.dotCN.contextmenuslider);
							let value = settings[slider.getAttribute("type")];
							let percent = BDFDB.mapRange([slider.getAttribute("min"), slider.getAttribute("max")], [0, 100], value);
							let grabber = slider.querySelector(BDFDB.dotCN.slidergrabber);
							grabber.style.setProperty("left", percent + "%");
							grabber.addEventListener("mousedown", e => {this.dragSlider(slider, value, e);});
							slider.querySelector(BDFDB.dotCN.sliderbarfill).style.setProperty("width", percent + "%");
							slider.querySelector(BDFDB.dotCN.sliderinput).value = value;
							slider.previousSibling.innerText = slider.getAttribute("name") + ": " + value + slider.getAttribute("unit");
						}
						let zoomlevelitem = zoomSettingsContext.querySelector(".zoomlevel-item");
						let lensesizeitem = zoomSettingsContext.querySelector(".lensesize-item");
						BDFDB.appendContextMenu(zoomSettingsContext, e);
					};
					settingslink.addEventListener("click", openContext);
					settingslink.addEventListener("contextmenu", openContext);
					img.ImageZoomMouseDownListener = e => {
						BDFDB.stopEvent(e);
						
						let settings = BDFDB.getAllData(this, "settings");
						
						BDFDB.appendLocalStyle("ImageZoomCrossHair", "* {cursor: crosshair !important;}");
						let imgrects = BDFDB.getRects(img);
						
						let lense = BDFDB.htmlToElement(`<div class="imagezoom-lense" style="width: ${settings.lensesize}px !important; height: ${settings.lensesize}px !important;"><div class="imagezoom-pane" style="background: url(${img.src}) center/cover no-repeat !important; width: ${imgrects.width * settings.zoomlevel}px; height: ${imgrects.height * settings.zoomlevel}px; position:fixed !important;"></div></div>`);
						let pane = lense.firstElementChild;
						let backdrop = BDFDB.htmlToElement(`<div class="imagezoom-backdrop" style="background: rgba(0,0,0,0.2) !important;"></div>`);
						document.querySelector(BDFDB.dotCN.appmount).appendChild(lense);
						document.querySelector(BDFDB.dotCN.appmount).appendChild(backdrop);
						
						let lenserects = BDFDB.getRects(lense), panerects = BDFDB.getRects(pane);
						let halfW = lenserects.width / 2, halfH = lenserects.height / 2;
						let minX = imgrects.left, maxX = minX + imgrects.width;
						let minY = imgrects.top, maxY = minY + imgrects.height;
						lense.style.setProperty("left", e.clientX - halfW + "px", "important");
						lense.style.setProperty("top", e.clientY - halfH + "px", "important");
						pane.style.setProperty("left", imgrects.left + ((settings.zoomlevel - 1) * (imgrects.left - e.clientX)) + "px", "important");
						pane.style.setProperty("top", imgrects.top + ((settings.zoomlevel - 1) * (imgrects.top - e.clientY)) + "px", "important");
						
						let dragging = e2 => {
							let x = e2.clientX > maxX ? maxX - halfW : e2.clientX < minX ? minX - halfW : e2.clientX - halfW;
							let y = e2.clientY > maxY ? maxY - halfH : e2.clientY < minY ? minY - halfH : e2.clientY - halfH;
							lense.style.setProperty("left", x + "px", "important");
							lense.style.setProperty("top", y + "px", "important");
							pane.style.setProperty("left", imgrects.left + ((settings.zoomlevel - 1) * (imgrects.left - x - halfW)) + "px", "important");
							pane.style.setProperty("top", imgrects.top + ((settings.zoomlevel - 1) * (imgrects.top - y - halfH)) + "px", "important");
						};
						let releasing = e2 => {
							BDFDB.removeLocalStyle('ImageZoomCrossHair');
							document.removeEventListener("mousemove", dragging);
							document.removeEventListener("mouseup", releasing);
							BDFDB.removeEles(lense, backdrop);
						};
						document.addEventListener("mousemove", dragging);
						document.addEventListener("mouseup", releasing);
					};
					img.addEventListener("mousedown", img.ImageZoomMouseDownListener);
				}
				else if (performance.now() - start > 10000) {
					clearInterval(waitForImg);
				}
			}, 100);
		}
		else if (methodnames.includes("componentWillUnmount")) {
			BDFDB.removeEles(".imagezoom-contextmenu", ".imagezoom-separator", ".imagezoom-settings", ".imagezoom-lense", ".imagezoom-backdrop");
		}
	}

	dragSlider (slider, value, e) {
		var grabber = e.currentTarget;
		var track = grabber.parentNode;
		var slider = track.parentNode;
		var input = slider.querySelector(BDFDB.dotCN.sliderinput);
		var barfill = slider.querySelector(BDFDB.dotCN.sliderbarfill);
		var min = slider.getAttribute("min");
		var max = slider.getAttribute("max");
		var unit = slider.getAttribute("unit");
		var digits = slider.getAttribute("digits");
		var type = slider.getAttribute("type");

		BDFDB.appendLocalStyle("disableTextSelection", `*{user-select: none !important;}`);

		var sY = 0;
		var sHalfW = BDFDB.getRects(grabber).width/2;
		var sMinX = BDFDB.getRects(track).left;
		var sMaxX = sMinX + BDFDB.getRects(track).width;
		var bubble = BDFDB.htmlToElement(`<span class="${BDFDB.disCN.sliderbubble}">${value + unit}</span>`);
		grabber.appendChild(bubble);
		var mouseup = () => {
			document.removeEventListener("mouseup", mouseup);
			document.removeEventListener("mousemove", mousemove);
			BDFDB.removeEles(bubble);
			BDFDB.removeLocalStyle("disableTextSelection");
			BDFDB.saveData(type, value, this, "settings");
			slider.previousSibling.innerText = slider.getAttribute("name") + ": " + value + unit;
		};
		var mousemove = e2 => {
			sY = e2.clientX > sMaxX ? sMaxX - sHalfW : (e2.clientX < sMinX ? sMinX - sHalfW : e2.clientX - sHalfW);
			value = parseInt(BDFDB.mapRange([sMinX - sHalfW, sMaxX - sHalfW], [min, max], sY)*Math.pow(10, digits))/Math.pow(10, digits);
			let percent = BDFDB.mapRange([sMinX - sHalfW, sMaxX - sHalfW], [0, 100], sY);
			grabber.style.setProperty("left", percent + "%");
			barfill.style.setProperty("width", percent + "%");
			input.value = value;
			bubble.innerText = value + unit;
		};
		document.addEventListener("mouseup", mouseup);
		document.addEventListener("mousemove", mousemove);
	}
	
	updateSlider	() {
		var sY = 0;
		var sHalfW = BDFDB.getRects(grabber).width/2;
		var sMinX = BDFDB.getRects(track).left;
		var sMaxX = sMinX + BDFDB.getRects(track).width;
	}
}
