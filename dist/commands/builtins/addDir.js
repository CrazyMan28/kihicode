import inquirer from 'inquirer';
import Indexer from '../../context/indexer.js';
const indexer = new Indexer();
const addDirCommand = {
    name: 'add-dir',
    description: 'Add a directory to project context',
    async execute(ctx, args) {
        let dir = args && args.length ? args[0] : undefined;
        if (!dir) {
            const res = await inquirer.prompt([{ type: 'input', name: 'dir', message: 'Directory to add' }]);
            dir = res.dir;
        }
        if (!dir) {
            ctx.stdout('No directory provided.');
            return;
        }
        try {
            await indexer.addDir(dir);
            ctx.stdout(`Added directory: ${dir}`);
        }
        catch (err) {
            ctx.stdout(`Error adding directory: ${err?.message ?? String(err)}`);
        }
    },
};
export default addDirCommand;
//# sourceMappingURL=addDir.js.map