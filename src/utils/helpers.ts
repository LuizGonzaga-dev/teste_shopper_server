import { Base64 } from "js-base64";

export const isBase64 = (imgWithoutPrefix: string): boolean => {
  try {
    return (
      Base64.isValid(imgWithoutPrefix) && imgWithoutPrefix.length % 4 === 0
    );
  } catch (e) {
    return false;
  }
};
