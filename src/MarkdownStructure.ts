import path from "path";

/**
 * This structure is used to parse the Markdown.
 */
export class MarkdownStructure {
    public md: any;
    public type = "";
    public file: path.ParsedPath;
    public parentDir = "";

    constructor(public filename: string) {
        console.debug("Markdown content", { filename });
        this.file = path.parse(filename);
        this.parentDir = path.dirname(filename).split(path.sep).pop() || ""
    }

    // returns the fileanem without an extension
    getFileWithoutExtension(): string {
        return this.file.name.replace(/\.[^/.]+$/, "")
    }
}