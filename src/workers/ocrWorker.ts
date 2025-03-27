import Tesseract from "tesseract.js";

Tesseract.setLogging(false);

const worker = await Tesseract.createWorker(
    "chi_sim+osd",
    Tesseract.OEM.DEFAULT
);

const recognizeImage = async (image: File) => {
    return await worker.recognize(image);
};

onmessage = async function (e) {
    const processed = await recognizeImage(e.data.image);
    this.postMessage(processed.data.text);
};
