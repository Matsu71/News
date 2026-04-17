import { Buffer } from "node:buffer";
import { deflateSync } from "node:zlib";

type Color = [number, number, number, number];

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function createSiteCardPng(width = 1200, height = 630): Buffer {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const colors = {
    white: [255, 255, 255, 255] as Color,
    ink: [31, 41, 51, 255] as Color,
    teal: [15, 118, 110, 255] as Color,
    red: [185, 55, 65, 255] as Color,
    greenSoft: [232, 247, 244, 255] as Color,
    gray: [216, 222, 228, 255] as Color,
    graySoft: [244, 247, 248, 255] as Color
  };

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      let color = colors.white;

      if (y < 22) {
        color = colors.teal;
      } else if (x < 172) {
        color = colors.greenSoft;
      } else if (isRect(x, y, 240, 120, 720, 36)) {
        color = colors.ink;
      } else if (isRect(x, y, 240, 190, 530, 20) || isRect(x, y, 240, 228, 420, 20)) {
        color = colors.gray;
      } else if (isRect(x, y, 240, 310, 70, 70) || isRect(x, y, 240, 420, 70, 70)) {
        color = y < 390 ? colors.teal : colors.red;
      } else if (
        isRect(x, y, 335, 318, 640, 18) ||
        isRect(x, y, 335, 350, 500, 14) ||
        isRect(x, y, 335, 428, 600, 18) ||
        isRect(x, y, 335, 460, 470, 14)
      ) {
        color = colors.ink;
      } else if (
        isRect(x, y, 210, 280, 790, 2) ||
        isRect(x, y, 210, 400, 790, 2) ||
        isRect(x, y, 210, 510, 790, 2)
      ) {
        color = colors.gray;
      } else if (isRect(x, y, 980, 110, 90, 370)) {
        color = colors.graySoft;
      }

      const pixelStart = rowStart + 1 + x * 4;
      raw[pixelStart] = color[0];
      raw[pixelStart + 1] = color[1];
      raw[pixelStart + 2] = color[2];
      raw[pixelStart + 3] = color[3];
    }
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    createChunk("IHDR", createIhdr(width, height)),
    createChunk("IDAT", deflateSync(raw)),
    createChunk("IEND", Buffer.alloc(0))
  ]);
}

function isRect(x: number, y: number, left: number, top: number, width: number, height: number): boolean {
  return x >= left && x < left + width && y >= top && y < top + height;
}

function createIhdr(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;
  return buffer;
}

function createChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let current = index;
  for (let bit = 0; bit < 8; bit += 1) {
    current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
  }
  return current >>> 0;
});
