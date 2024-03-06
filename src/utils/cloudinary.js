import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // file has been uploaded successfull
    // console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath) // agar file upload ho jaye, to server se delete kar denge file ko
    return response;
    
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove temporary file as the upload failed. it is protect from malicious files 
    console.error("ERROR: ", error)
    throw error
  }
}

const deleteFromCloudinary = async (cPath) => {
  try {
    if(!cPath) return null
    const response = await cloudinary.uploader.destroy(cPath);
    return response;
  } catch (error) {
    console.error("ERROR: ", error);
    throw error
  }
}


export {uploadOnCloudinary, deleteFromCloudinary}