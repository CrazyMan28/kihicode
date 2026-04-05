"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.ToolRegistry = void 0;
class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    getJsonSchema() {
        return this.getAllTools().map(t => ({
            name: t.name,
            description: t.description,
            input_schema: {
                type: 'object',
                properties: t.schema.shape,
            }
        }));
    }
}
exports.ToolRegistry = ToolRegistry;
exports.registry = new ToolRegistry();
