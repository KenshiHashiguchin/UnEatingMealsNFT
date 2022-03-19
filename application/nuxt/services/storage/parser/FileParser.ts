import { HeaderType } from '../HeaderType';

export interface SplitResult {
    multiLevelChunks: Uint8Array[][];
    // multiLevelChunks: Uint8Array[][] | string[][];
    // multiLevelChunks: string[][];
    header?: Record<string, HeaderType>;
}

export interface FileParser {
    name: string;
    supportedMimeTypes: string[];
    split(content: Uint8Array | string): Promise<SplitResult>;
    join(chunks: Uint8Array[][]): Promise<Uint8Array>;
}
