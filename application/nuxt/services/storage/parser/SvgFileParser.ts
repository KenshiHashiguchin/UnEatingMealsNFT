import { Convert } from 'symbol-sdk';
import { Utils } from '../Utils';
import { FileParser, SplitResult } from './FileParser';

export interface SvgChunk {
    data: Buffer;
    name: string;
}

export interface SvgMetadata {
    viewBox: string,
}

export class SvgFileParser implements FileParser {
    public static readonly NAME = 'svg';
    public readonly name = SvgFileParser.NAME;
    public readonly supportedMimeTypes = ['image/svg+xml'];

    // public getMetadata(content: Buffer): PngMetadata {
    //     // NOT USED YET, but could be useful to show user friendly metadata to the user.
    //     const signature = this.getSignatureChunk(content);
    //     const header = this.getChunk(content, signature.data.length, SvgFileParser.TYPE_IHDR);
    //     const data = header.data.slice(8);
    //     const width = data.readUInt32BE(0);
    //     const height = data.readUInt32BE(4);
    //     const depth = data[8];
    //     const colorType = data[9]; // bits: 1 palette, 2 color, 4 alpha
    //     const compr = data[10];
    //     const filter = data[11];
    //     const interlace = data[12];
    //     return {
    //         width: width,
    //         height: height,
    //         depth: depth,
    //         interlace: Boolean(interlace),
    //         palette: Boolean(colorType & SvgFileParser.COLORTYPE_PALETTE),
    //         color: Boolean(colorType & SvgFileParser.COLORTYPE_COLOR),
    //         alpha: Boolean(colorType & SVgFileParser.COLORTYPE_ALPHA),
    //         compr: compr,
    //         filter: filter,
    //         colorType: colorType,
    //     };
    // }

    // public getChunks(data: Buffer): SvgChunk[] {
    //     const chunks: SvgChunk[] = [];
    //     chunks.push(this.getSignatureChunk(data)); // png signature
    //     let start = 8;
    //     while (start < data.length) {
    //         const chunk = this.getChunk(data, start);
    //         chunks.push(chunk);
    //         start += chunk.data.length;
    //     }
    //     return chunks;
    // }

    // public getChunk(data: Buffer|string, start: number, expectedType?: number): SvgChunk {
    //     const chunkSize = data.readUInt32BE(start);
    //     const type = data.readUInt32BE(start + 4);
    //     const chunkType = data.slice(start + 4, start + 8);
    //     let name = '';
    //     for (let i = 4; i < 8; i++) {
    //         name += String.fromCharCode(data[start + i]);
    //     }
    //     const isValid = SvgFileParser.TYPES.find((t) => t == type);
    //     if (!isValid) {
    //         throw new Error(`Invalid png type ${Convert.uint8ToHex(chunkType)}`);
    //     }
    //     if (expectedType && expectedType != type) {
    //         throw new Error(`Invalid expected type ${Convert.uint8ToHex(chunkType)}. Expected DECIMAL ${expectedType} but got ${type}`);
    //     }
    //     const end = start + chunkSize + 4 + 4 + 4;
    //     const chunk = data.slice(start, end);
    //     return { data: chunk, type, name };
    // }

    split(content: Uint8Array): Promise<SplitResult> {
        const data = Buffer.from(content);
        const chunks: SvgChunk[] = [];
        chunks.push({data: data, name: 'body'});
        console.log(`split`);
        console.log(chunks);
        const multiLevelChunks = chunks.map((c) => Utils.split(c.data));
        const header = {
            viewBox: "0 0 64 64",
            xmlns: "http://www.w3.org/2000/svg",
            id: "meals", //TODO meals, wealable
        };
        return Promise.resolve({
            multiLevelChunks: multiLevelChunks,
            header: header,
        });
    }

    join = Utils.join;
}
