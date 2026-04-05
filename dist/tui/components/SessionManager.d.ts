import React from 'react';
interface SessionManagerProps {
    sessions: string[];
    onSelect: (session: string) => void;
    onClose: () => void;
}
export declare const SessionManager: React.FC<SessionManagerProps>;
export {};
