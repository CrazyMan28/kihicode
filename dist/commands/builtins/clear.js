const clearCommand = {
    name: 'clear',
    description: 'Clear the screen',
    execute() {
        process.stdout.write('\x1Bc');
    },
};
export default clearCommand;
//# sourceMappingURL=clear.js.map