import { Router } from 'express'
import { addViewCount, deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from '../controllers/video.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()
router.use(verifyJWT)

router.route('/')
    .get(getAllVideos)
    .post(
    upload.fields([
        {
            name: 'video',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]),
    publishVideo
    )

router.route('/:videoId')
    .get(getVideoById)
    .post(deleteVideo)
    .patch( upload.single("thumbnail"), updateVideo)

router.route('/add/view/:videoId')
    .patch(addViewCount)

router.route('/toggle/publish/:videoId')
    .patch(togglePublishStatus)

export default router

