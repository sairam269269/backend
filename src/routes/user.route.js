import { Router} from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser,loginUser,logoutUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middlware.js";
const router=Router()
      router.route("/register").post(
            upload.fields([
                  {
                        name:"avatar",
                        maxCount:1
                  },
                  {
                        name:"coverImage",
                        maxCount:1
                  }
            ]),
            registerUser)
      router.route("/login").post(loginUser)
      router.route("/logout").post(verifyJwt,logoutUser)
      router.route("/refresh-token").post(refreshAccessToken)
      router.route("/change-password").post(verifyJwt,changeCurrentPassword)
      router.route("/current-user").get(verifyJwt,getCurrentUser)
      router.route("/update-user").patch(verifyJwt,updateUserDetails)
      router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
      router.route("/coverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)
      router.route("/C/:username").get(verifyJwt,getUserChannelProfile)
      router.route("/history").get(verifyJwt,getWatchHistory)

export default router