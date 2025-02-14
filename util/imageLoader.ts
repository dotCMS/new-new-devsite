import { useDotcmsPageContext } from "@dotcms/react";
import { Config } from "./config";
interface ImageLoaderProps {
  src: string;
  width: number;
}

const ImageLoader = ({ src, width }: ImageLoaderProps): string => {
  const dotcmsURL = new URL(Config.CDNHost || '').origin;

  const context = useDotcmsPageContext();

  const languageId = context?.pageAsset?.viewAs?.language?.id ?? 1;

  const imageSRC = src.includes("/dA/") ? src : `/dA/${src}`; // Check if the image is a DotCMS asset or a file asset

  return `${dotcmsURL}${imageSRC}/${width}?language_id=${languageId}`;
};

export default ImageLoader;