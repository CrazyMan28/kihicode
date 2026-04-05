export class ToolRegistry {
    tools = new Map();
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
export const registry = new ToolRegistry();
//# sourceMappingURL=registry.js.map