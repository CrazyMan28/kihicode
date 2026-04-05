const exitCommand = {
    name: 'exit',
    description: 'Exit the application',
    execute(ctx) {
        ctx.stdout('Exiting...');
        ctx.exit(0);
    },
};
export default exitCommand;
//# sourceMappingURL=exit.js.map