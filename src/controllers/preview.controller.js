import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "node:fs";

const preview = asyncHandler(async (req, res) => {
  let asset;
  if (req.file && req.file.path) {
    const localPath = req.file.path;
    asset = await uploadOnCloudinary(localPath);
  }

  fs.writeFile("./public/temp/url.txt", asset.secure_url, "utf8", (err) => {
		if(err) throw err;
	});

  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url: asset.secure_url },
        "Preview generated successfully"
      )
    );
});

const deletePreview = asyncHandler(async (req, res) => {
  const preview = await deleteFromCloudinary(req.body.url);

  return res
    .status(200)
    .json(new ApiResponse(200, preview, "Preview deleted successfully"));
});

export { preview, deletePreview };
