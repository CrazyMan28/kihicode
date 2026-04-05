# Developer: Adding Custom Commands

Place a `.ts` or `.js` file under `.kihicode/commands/` that exports a default `Command` object:

Example:

```ts
import { Command } from 'path-to-kihicode/src/commands/Command';

const myCmd: Command = {
  name: 'hello',
  description: 'Say hello',
  async execute(ctx, args) {
    ctx.stdout('Hello ' + (args[0] ?? 'world'));
  }
};

export default myCmd;
```

The loader runs at startup and will register valid commands automatically.
