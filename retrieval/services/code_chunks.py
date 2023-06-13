from typing import Dict, List, Optional, Tuple
from models.models import Document, DocumentChunk, DocumentChunkMetadata
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typescript_textsplitter import TypescriptTextSplitter
from text_chunks import get_text_chunks

def get_lang_splitter(lang: str):
    RecursiveCharacterTextSplitter.from_language(
        language=lang, chunk_size=50, chunk_overlap=0
    )

# use LangChain CodeSplitter with custom TypeScript splitter
def get_code_chunks(doc: Document, chunk_token_size: Optional[int]) -> List[str]:
    ts_splitter = TypescriptTextSplitter.build()

    lang = doc.metadata.langCode

    lang_splitter = ts_splitter if lang is "typescript" else get_lang_splitter(lang)

    # default to use text chunk splitter if no matching specific lang splitter is found 
    if not lang_splitter:
        return get_text_chunks(doc, chunk_token_size)
        
    return lang_splitter.create_documents([doc.text])


