"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = void 0;
exports.initCommands = initCommands;
const registry_1 = require("./registry");
const help_1 = __importDefault(require("./builtins/help"));
const exit_1 = __importDefault(require("./builtins/exit"));
const login_1 = __importDefault(require("./login"));
const clear_1 = __importDefault(require("./builtins/clear"));
const status_1 = __importDefault(require("./builtins/status"));
const addDir_1 = __importDefault(require("./builtins/addDir"));
const context_1 = __importDefault(require("./builtins/context"));
const remember_1 = __importDefault(require("./builtins/remember"));
const memory_1 = __importDefault(require("./builtins/memory"));
const forget_1 = __importDefault(require("./builtins/forget"));
const subagent_1 = __importDefault(require("./builtins/subagent"));
const logout_1 = __importDefault(require("./builtins/logout"));
const loader_1 = require("./loader");
exports.registry = new registry_1.CommandRegistry();
async function initCommands() {
    // avoid double-registration
    if (exports.registry.list().length > 0)
        return;
    exports.registry.register(help_1.default);
    exports.registry.register(exit_1.default);
    exports.registry.register(login_1.default);
    exports.registry.register(clear_1.default);
    exports.registry.register(status_1.default);
    exports.registry.register(addDir_1.default);
    exports.registry.register(context_1.default);
    exports.registry.register(remember_1.default);
    exports.registry.register(memory_1.default);
    exports.registry.register(forget_1.default);
    exports.registry.register(subagent_1.default);
    exports.registry.register(logout_1.default);
    // load user-provided commands if any
    (0, loader_1.loadCustomCommands)(exports.registry).catch(() => { });
}
exports.default = exports.registry;
