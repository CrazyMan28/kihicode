import React from 'react';
interface CommandItem {
    name: string;
    description?: string;
}
declare const Palette: React.FC<{
    commands: CommandItem[];
    onSelect: (name: string) => void;
    onClose: () => void;
}>;
export default Palette;
