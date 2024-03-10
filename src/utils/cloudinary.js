import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicId = (cloudinaryURL) => {
  let startIndex = 0;
  let endIndex = 0;
  for (let i = cloudinaryURL.length - 1; i >= 0; i--) {
    if (cloudinaryURL.charAt(i) === "." && endIndex === 0) {
      endIndex = i;
    } else if (cloudinaryURL.charAt(i) === "/" && startIndex === 0) {
      startIndex = i + 1;
    }
    if (startIndex !== 0 && endIndex !== 0) {
      break;
    }
  }

  return cloudinaryURL.substring(startIndex, endIndex);
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath); // agar file upload ho jaye, to server se delete kar denge file ko
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove temporary file as the upload failed. it is protect from malicious files
    console.error("ERROR: ", error);
    throw error;
  }
};

const deleteFromCloudinary = async (cloudinaryURL) => {
  try {
    if (!cloudinaryURL) return null;
    let publicId = getPublicId(cloudinaryURL);

    // get everything by public id
    // cloudinary.api.resource(publicId).then(result => console.log(result));

    let result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
