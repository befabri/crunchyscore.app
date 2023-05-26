import axios from "axios";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let retryCount = 0;
const maxRetries = 4;
const numberObjects = 4;

// Function to delete all files in a directory
function deleteFiles(directory) {
  fs.readdirSync(directory).forEach((file) => {
    fs.unlinkSync(path.join(directory, file));
  });
}

// Function to move all files from one directory to another
function moveFiles(sourceDir, destDir) {
  fs.readdirSync(sourceDir).forEach((file) => {
    fs.renameSync(path.join(sourceDir, file), path.join(destDir, file));
  });
}

async function downloadImage() {
  try {
    if (retryCount >= maxRetries) {
      console.log("Maximum retry count exceeded");
      return;
    }

    const url = `${BASE_URL}/${numberObjects}`;
    console.log(url);
    const response = await axios({
      url,
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    let resultData = [];
    for (const anime of response.data.anime) {
      let isImageDownloaded = false;
      for (const picture of anime.pictures) {
        const imgResponse = await axios({
          url: picture.large,
          method: "GET",
          responseType: "stream",
        });

        const outputPath = path.resolve(__dirname, "../src/assets/tmp", `${anime.crunchyroll_id}.jpg`);
        const writer = fs.createWriteStream(outputPath);

        imgResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        const metadata = await sharp(outputPath).metadata();

        if (metadata.height > metadata.width) {
          console.log(`Downloaded image from ${picture.large}`);
          isImageDownloaded = true;
          resultData.push({ title: anime.title, mean: anime.mean, crunchyroll_id: anime.crunchyroll_id });
          break;
        } else {
          fs.unlinkSync(outputPath);
          console.log(`Image from ${picture.large} doesn't meet the criteria, trying next link...`);
        }
      }

      if (!isImageDownloaded) {
        retryCount++;
        console.log(
          `No suitable image found for ${anime.title}, retrying with another anime (${retryCount}/${maxRetries})`
        );
      }
    }

    if (retryCount < maxRetries) {
      const finalDirPath = path.resolve(__dirname, "../src/assets/hero");
      deleteFiles(finalDirPath);
      moveFiles(path.resolve(__dirname, "../src/assets/tmp"), finalDirPath);
    }

    fs.writeFileSync(path.resolve(__dirname, "../src/data/anime_data.json"), JSON.stringify(resultData, null, 2));
  } catch (error) {
    console.error(error);
  }
}

downloadImage().then(() => console.log(`Process completed`));
