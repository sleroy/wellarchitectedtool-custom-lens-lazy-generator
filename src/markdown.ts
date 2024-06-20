import {
    Markdown,
    MarkdownParserOptions,
} from "@cenguidanos/node-markdown-parser";
import { readFileSync } from "fs";
import { MarkdownStructure } from './MarkdownStructure';

export function parseMD(filename: string): MarkdownStructure {
    const file: string = readFileSync(filename, "utf-8");

    return parseMdStr(file, filename);
}

export function parseMdStr(fileContent: string, filename: string): MarkdownStructure {
    const markdownOptions: MarkdownParserOptions = {

    };
    const markdown: Markdown = new Markdown(markdownOptions);
    const data = markdown.toJSON(fileContent as any);
    const mdStruct = new MarkdownStructure(filename);
    mdStruct.md = data;
    if (!mdStruct.md.body) {
        console.error({ filename, data })
        throw new Error("Markdown content should not be empty.")
    }
    return mdStruct;
}