
import { Config } from "./config";

interface ImageLoaderProps {
    src: string;
    width: number;
}



const ImageLoader = ({ src, width }: ImageLoaderProps): string => {
    console.log("src", src);
    if (!src.includes("/dA/")) {
        return src;
    }

    const urlString = src.indexOf("/") === 0 ? Config.CDNHost + src : src;

    const url = new URL(urlString).pathname;
    if (url.endsWith(".svg")) {
        return src;
    }

    const parts = url.substring(4).split("/")
    console.log("parts", parts.join(","));
    const identifier = parts[0];
    const fieldName = parts[1];
    let fileName = "image-file";
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes(".")) {
            fileName = parts[i];
            break;
        }
    }

    const maxWidth = width && (width > 0 && width <= 1024) ? width : 1024;

    const finalURL = `${Config.CDNHost}/dA/${identifier}${fieldName? "/" + fieldName:""}/70q/${maxWidth}maxw/${fileName}`; 
    console.log("finalURL", finalURL);
    return finalURL;
};

export default ImageLoader;