import { Request,Response } from "express";
import { createRecord_service,get_videoByID_service,list_videoRecord_service} from "../service/video.service";
import { getOutputRelativepath, getuploadRelativePath } from "../lib/media";
import { StartVideoProcessingWorkflow } from "../lib/temporal";

export async function upload_controller(res:Response,req:Request){
    if(!req.file){
        return res.status(400).json({
            sucess:false,
            message:"No file upload"
        })
    }
    const videoId=String(Date.now());
    const inputRelativepath=getuploadRelativePath(req.file.path);
    const outputRelativepath=getOutputRelativepath(videoId)

    try{
        await createRecord_service(videoId,req.file.originalname)
        const worlflowId=await StartVideoProcessingWorkflow({videoId,inputRelativepath,outputRelativepath})
        return res.status(200).json({
            sucess:true,
            message:"start video processing",
            data:{
                videoId,
                worlflowId
            }
        })
    }catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
export async function get_video_RecordController(res:Response,req:Request){
    const videoId=req.params.videoId
    if(!videoId){
        return res.status(400).json({
            success:false,
            message:"videoId is requried"
        })
    }
    try{
        const video=await get_videoByID_service(String(videoId));
        if(!video){
            return res.status(400).json({
            success:false,
            message:"video not found"
        })
        }
        res.status(200).json({
            success:true,
            data:{
                videoId:video.videoId,
                OriginalFilename:video.originalfilename,
                proccessingStatus:video.processingStatus,
                CreatedAt:video.createdAt,
                streamUrl: video.processingStatus === 'completed' ? `/media/output/${video.videoId}/master.m3u8` : null,
            }
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
export async function list_videoController(req:Request,res:Response){
    try{
        const videos=await list_videoRecord_service();
        res.status(200).json({
            success:true,
            data:videos.map((video)=>({
                videoId:video.videoId,
                OriginalFilename:video.originalfilename,
                proccessingStatus:video.processingStatus,
                CreatedAt:video.createdAt,
                streamUrl: video.processingStatus === 'completed' ? `/media/output/${video.videoId}/master.m3u8` : null,
            }))
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}