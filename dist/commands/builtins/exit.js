"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exitCommand = {
    name: 'exit',
    description: 'Exit the application',
    execute(ctx) {
        ctx.stdout('Exiting...');
        ctx.exit(0);
    },
};
exports.default = exitCommand;
