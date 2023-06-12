import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { TypescriptTextSplitter } from "./typescript-textsplitter";
import { TextSplitterChunkHeaderOptions } from "langchain/text_splitter";

export const createDocsFromCode = async (codeFiles: string[], metadatas?: Record<string, any>[], chunkHeaderOptions?: TextSplitterChunkHeaderOptions): Promise<Document[]> =>  {
    const typescriptSplitter = new TypescriptTextSplitter().build({
        chunkSize: 60, 
        chunkOverlap: 20,
        ...chunkHeaderOptions || {}
    });    
    return await typescriptSplitter.createDocuments(codeFiles, metadatas, chunkHeaderOptions);    
};




