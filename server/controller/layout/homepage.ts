import { NextFunction, Request, Response } from "express";
import CatchAsyncFunction from "../../config/CatchAsyncError";
import { LayoutImage } from "../../types";
import ErrorHandler from "../../config/ErrorHandler";
import cloudinary from "cloudinary";
import homepageModel from "../../model/homepage.model";

//create and update banner
export const addBannerImage = CatchAsyncFunction(
  async (req: Request, res: Response, next: NextFunction) => {
    const { image } = req.body;
    //console.log(req.body)
    // return res.sendStatus(201)
    if (!image) {
      return next(new ErrorHandler("Please, upload an image", 400));
    }

    //upload to cloudinary
    try {
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        upload_preset: "dev_setup",
        //moderation: "duplicate:0.8",
      });

      const newBanner = {
        public_src: myCloud.public_id,
        url: myCloud.secure_url,
      } as LayoutImage;
      //save to db;
      const banner = await homepageModel.findOne({}, { banner: 1 });

      //if banner is undefined
      if (banner === undefined) {
        return res.sendStatus(404);
      }
      // The DB document might be alread create show we have to update by create new banner
      if (banner === null) {
        //create new banner
        await homepageModel.create({
          banner: newBanner,
        });
        return res.status(201).json({ success: true, banner: [newBanner] });
      } else {
        // This not the first first banner created, so we append it to the banner array
        //append and save to db
        banner?.banner.push(newBanner);

        await banner?.save();
        res.status(201).json({ success: true, banner: banner?.banner });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// Get all banners
export const getBanners = CatchAsyncFunction(
  async (req: Request, res: Response, next: NextFunction) => {
    const allBanner = await homepageModel.findOne({}, { banner: 1 });
    // console.log(allBanner)
    return res.status(200).json({
      success: true,
      banners: allBanner?.banner,
    });
  }
);

//Delete banner by id
export const deleteBanner = CatchAsyncFunction(
  async (req: Request, res: Response, next: NextFunction) => {
    const bannerId = req.body.id;

    if (!bannerId) {
      //Bad request
      return next(
        new ErrorHandler("banner ID is required to perform this operation", 400)
      );
    }
    try {
      //get the element from db
      const getBanner = await homepageModel
        .findOne({})
        .select({ banner: { $elemMatch: { _id: bannerId } } });

      if (!getBanner) {
        return next(new ErrorHandler("File dost not exist", 404));
      }

      //  //delet from cloudinary
      const public_id = getBanner?.banner[0].public_src;
      await cloudinary.v2.uploader.destroy(public_id!);

      //delete from db
      await homepageModel.updateOne(
        {},
        {
          $pull: {
            banner: { _id: bannerId },
          },
        }
      );
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }

    return res.status(201).json({
      success: true,
    });
  }
);

export const updateCarouselBackImage = CatchAsyncFunction(
  async (req: Request, res: Response, next: NextFunction) => {
    const { image } = req.body;
    //console.log(req.body)
    // return res.sendStatus(201)
    if (!image) {
      return next(new ErrorHandler("Please, upload an image", 400));
    }
    const backCarousel = await homepageModel.findOne({}, { calbackImage: 1 });
    console.log(backCarousel);
    if (!backCarousel) {
      return res.sendStatus(404);
    }
    //upload to cloudinary
    try {
      //   const myCloud = await cloudinary.v2.uploader.upload(image, {
      //     upload_preset: "dev_setup",
      //     //moderation: "duplicate:0.8",
      //   });

      //   const newCalBackImage = {
      //     public_src: myCloud.public_id,
      //     url: myCloud.secure_url,
      //   } as LayoutImage;
      //save to db;

      //append and save to db
      // if(backCarousel?.$isEmpty){

      // }

      res.status(201).json({ success: true });
    } catch (error) {
      console.log(error);
    }
  }
);
