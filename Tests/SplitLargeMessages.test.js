const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const path = require("node:path");
const {test} = require("node:test");
const vm = require("node:vm");

const filename = path.join(__dirname, "../Plugins/SplitLargeMessages/SplitLargeMessages.plugin.js");
const source = readFileSync(filename, "utf8");

function createPlugin (splitCounter, byNewlines, premium = false) {
	const BDFDB = {
		LibraryModules: {
			NitroUtils: {canUseIncreasedMessageLength: () => premium},
			ChatRestrictionUtils: {}
		},
		LibraryStores: {UserStore: {getCurrentUser: () => ({})}},
		DiscordConstants: {MAX_MESSAGE_LENGTH: 2000, MAX_MESSAGE_LENGTH_PREMIUM: 4000},
		PatchUtils: {patch: () => {}, forceAllUpdates: () => {}}
	};
	const context = {
		module: {exports: {}},
		window: {
			BDFDB_Global: {
				loaded: true,
				PluginUtils: {buildPlugin: () => [class {}, BDFDB]}
			}
		}
	};
	vm.runInNewContext(source, context, {filename});
	const plugin = new context.module.exports();
	plugin.settings = {
		general: {byNewlines, leaveGaps: false},
		amounts: {splitCounter, maxMessages: 0}
	};
	plugin.onStart();
	return plugin;
}

for (const premium of [false, true]) {
	const accountLimit = premium ? 4000 : 2000;
	for (const splitCounter of [1001, accountLimit - 1, accountLimit, 0]) {
		for (const byNewlines of [false, true]) {
			test(`splits long ${byNewlines ? "lines" : "words"} at ${splitCounter} with a ${accountLimit} account limit`, () => {
				const plugin = createPlugin(splitCounter, byNewlines, premium);
				const text = (byNewlines ? "a b" : "abc").repeat(1500);
				const messages = plugin.formatText(text);
				const limit = splitCounter || accountLimit;

				assert.ok(messages.length > 1, "long input must be split into multiple messages");
				assert.ok(messages.every(message => message.length > 0 && message.length <= limit),
					`message lengths ${messages.map(message => message.length)} exceed ${limit}`);
				assert.equal(messages.join(""), text, "splitting must preserve the input text");
			});
		}
	}
}
