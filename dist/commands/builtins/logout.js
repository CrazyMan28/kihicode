import inquirer from 'inquirer';
const logoutCommand = {
    name: 'logout',
    description: 'Remove stored credentials for a provider',
    async execute(ctx, args) {
        let provider = args && args.length ? args[0] : undefined;
        if (!provider) {
            const res = await inquirer.prompt([{ type: 'input', name: 'provider', message: 'Provider to logout (e.g. openai)' }]);
            provider = res.provider;
        }
        try {
            await ctx.authStore.deleteCredentials(provider);
            ctx.stdout(`Removed credentials for ${provider}`);
        }
        catch (err) {
            ctx.stdout(`Failed to remove credentials: ${err?.message ?? String(err)}`);
        }
    },
};
export default logoutCommand;
//# sourceMappingURL=logout.js.map