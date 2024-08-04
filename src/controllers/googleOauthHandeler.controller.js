import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateAccessAndRefereshTokens,
  getUsername,
} from "./user.controller.js";

async function getGoogleOauthToken(code) {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    });

    const resJSON = await res.json();
    return resJSON;
  } catch (error) {
    console.error(error.response.data.error);
    log.error(error, "Failed to fetch Google Oauth Tokens");
    throw new Error(error.message);
  }
}

async function getGoogleUser(id_token, access_token) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    const resJSON = await res.json();
    return resJSON;
  } catch (error) {
    log.error(error, "Error fetching Google user");
    throw new Error(error.message);
  }
}

async function googleOauthHandeler(req, res, next) {
  const code = req.query.code;

  try {
    const { id_token, access_token } = await getGoogleOauthToken(code);

    const googleUser = await getGoogleUser(id_token, access_token); //OR, jwt.decode(id_token)

    if (!googleUser) throw new ApiError(500, "User not found");

    const existingUser = await User.findOne({ email: googleUser.email });

    if (existingUser) {
      const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(existingUser._id);

      const loggedInUser = await User.findById(existingUser._id).select(
        "-password -refreshToken"
      );

      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      res.cookie("accessToken", accessToken, options)
      res.cookie("refreshToken", refreshToken, options)
      res.redirect("https://vidshare.goutamdogri.com/home");
    } else {
      const username = await getUsername();

      const user = await User.create({
        fullName: googleUser.name,
        avatar: googleUser.picture,
        email: googleUser.email,
        password: googleUser.id,
        username,
      });

      const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(user._id);

      const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
      );

      if (!createduser) {
        throw new ApiError(
          500,
          "Something went wrong while registering the user"
        );
      }

      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      res.cookie("accessToken", accessToken, options)
      res.cookie("refreshToken", refreshToken, options)
      res.redirect("https://vidshare.goutamdogri.com/home");
    }
  } catch (error) {
    console.log(error, "Failed to autherize google autherization");
    return res.redirect("https://vidshare.goutamdogri.com/");
  }
}

export default googleOauthHandeler;
