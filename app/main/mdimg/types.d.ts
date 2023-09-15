import type { LaunchOptions } from "puppeteer";

interface IConvertOptions {
  mdText?: string;
  mdFile?: string;
  outputFilename?: string;
  type?: "jpeg" | "png" | "webp";
  width?: number;
  height?: number;
  encoding?: "binary" | "base64";
  quality?: number;
  htmlTemplate?: "default" | "words";
  cssTemplate?: "default" | "empty" | "github" | "githubDark" | "words";
  log?: boolean;
  puppeteerProps?: LaunchOptions;
}

interface IConvertResponse {
  data: string | Buffer;
  path?: string;
  html: string;
}

declare function convert2img(props: IConvertOptions): Promise<IConvertResponse>;

export { convert2img, IConvertOptions, IConvertResponse };
