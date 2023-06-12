const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const app = express();
const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
const fs = require("fs");
const { readdir } = require("fs/promises");

app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.listen(5000, () => {
  console.log("Server is up: 5000");
});

async function nsfwImageDetection(req, res) {
  const { file_name, file_path } = req.body;
  const dir_name = file_path.split("/")[2];
  const imagePath = path.join(__dirname, "../", dir_name, file_name);
  try {
    fs.readFile(imagePath, async (err, data) => {
      const model = await nsfw.load();
      const image = tf.node.decodeImage(data, 3);
      const predictions = await model.classify(image);
      let isAllowed = true;
      predictions.forEach((p) => {
        console.log(p);
        if ((p.className == "Hentai" || p.className == "Porn") && isAllowed) {
          isAllowed = p.probability > 0.95 ? false : true;
        }
      });
      console.log(isAllowed);
      return res.status(200).json({
        status: isAllowed,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "issue with the provided file!",
    });
  }
}

async function nsfwVideoDetection(req, res) {
  const { file_name, file_path } = req.body;
  const dir_name = file_path.split("/")[2];
  const dirPath = path.join(__dirname, "../", dir_name);
  try {
    let files = await readdir(dirPath);
    files = files.filter((file) => file != file_name);
    let promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        let filePath = path.join(dirPath, file);
        fs.readFile(filePath, async (err, data) => {
          if (err) {
            reject(err);
          }
          const model = await nsfw.load();
          const image = tf.node.decodeImage(data, 3);
          const predictions = await model.classify(image);
          let isAllowed = true;
          predictions.forEach((p) => {
            console.log(p);
            if (
              (p.className == "Hentai" || p.className == "Porn") &&
              isAllowed
            ) {
              isAllowed = p.probability > 0.95 ? false : true;
            }
          });
          console.log(isAllowed);
          resolve({
            status: isAllowed,
          });
        });
      });
    });

    Promise.all(promises)
      .then((data) => {
        let isAllowed = true;
        data.forEach((d) => {
          if (!d.status) isAllowed = false;
        });
        return res.status(200).json({
          status: isAllowed,
        });
      })
      .catch((err) => {
        console.log(error);
        return res.status(500).json({
          msg: "issue with the provided file!",
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "issue with the provided file!",
    });
  }
}

app.post("/api/nsfw/image", nsfwImageDetection);
app.post("/api/nsfw/video", nsfwVideoDetection);
