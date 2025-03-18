import Tesseract from "tesseract.js";

Tesseract.setLogging(false);

const recognizeImage = async (image: File) => {
    return await Tesseract.recognize(image, "chi_sim");
};

onmessage = async function (e) {
    const processed = await recognizeImage(e.data.image);
    this.postMessage(processed.data);
};
