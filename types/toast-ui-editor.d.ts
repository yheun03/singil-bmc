declare module '@toast-ui/editor' {
    export type EditorOptions = {
        el: HTMLElement;
        height?: string;
        initialEditType?: 'markdown' | 'wysiwyg';
        previewStyle?: 'vertical' | 'tab';
        initialValue?: string;
        usageStatistics?: boolean;
    };

    export default class Editor {
        constructor(options: EditorOptions);
        on(eventName: 'change', handler: () => void): void;
        getMarkdown(): string;
        setMarkdown(markdown: string, cursorToEnd?: boolean): void;
        destroy(): void;
    }
}
