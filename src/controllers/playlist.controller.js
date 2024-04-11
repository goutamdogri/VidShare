import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { mongoose } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    let { name, description } = req.body;

    if(name === undefined || name.trim() === "") throw new ApiError(400, "Playlist name is required");
    if(description === undefined) description = "";

    const playlist = await Playlist.create({
        name,
        description : description.trim(),
        owner: req.user._id
    })

    if(!playlist) throw new ApiError(500, "Playlist does not created")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist created successfully")
        )
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if(!userId) throw new ApiError(400, "userId is necessary")

    const playlists = await Playlist.find({
        owner: new mongoose.Types.ObjectId(userId)
    })

    if(!playlists) throw new ApiError(400, "playlist does not found")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "user playlists found successfully")
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId) throw new ApiError(400, "playlist Id is required")

    const playlist = await Playlist.findOne({
        _id: playlistId,
    })

    if(!playlist) throw new ApiError(500, "playlist not found")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist found successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if(!playlistId || !videoId) throw new ApiError(400, "playlistId and videoId both are required")

    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(400, "videoId does not exist")

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $addToSet: { // this operator conditionally add data if only the data does not already exist in the array
                videos: videoId
            }
        },
        { new: true }
    )

    if(!playlist) throw new ApiError(500, "video does not add to plalist because either playlistId is wrong or login user is not the owner of playlistId or server problem while finding the document")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "video added to playlist successfully")
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if(!playlistId || !videoId) throw new ApiError(400, "playlistId and videoId both are required")

    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(400, "videoId does not exist")

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )

    if(!playlist) throw new ApiError(500, "video does not remove from plalist because either playlistId is wrong or login user is not the owner of playlistId or server problem while finding the document")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "video removed from playlist successfully")
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId) throw new ApiError(400, "playlist Id is required")

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    })

    if(!playlist) throw new ApiError(500, "playlist not found because either playlistId is wrong or login user is not the owner of playlistId or server problem while finding the document")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist deleted successfully")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if(!playlistId) throw new ApiError(400, "playlist Id is required")

    const updateField = {}
    if(name === undefined && description === undefined) {
        throw new ApiError(400, "changes in name or in description required")
    }
    if(description !== undefined) {
        updateField.description = description.trim()
    }
    if(name !== undefined) {
        if(name.trim() === "") {
            throw new ApiError(400, "playlist name can't be empty")
        } else {
            updateField.name = name.trim()
        }
    }
console.log(updateField);

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: updateField
        },
        { new: true }
    )

    if(!playlist) throw new ApiError(500, "playlist not found because either playlistId is wrong or login user is not the owner of playlistId or server problem while finding the document")

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist updated successfully")
        )
})

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist };
