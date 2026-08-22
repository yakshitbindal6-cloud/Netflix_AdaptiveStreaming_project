import {prisma} from "../lib/prisma"
import { ProcessingStatus } from "@adaptive-streaming/shared"
export async function create_videoRecord(videoId:string,originalfilename?:string){
    return await prisma.video.create({
        data:{
            videoId,
            originalfilename:originalfilename||" ",
            processingStatus:"pending"
        }
    })
}
export async function update_videoRecord(videoId:string, processingStatus:ProcessingStatus){
    return await prisma.video.update({
        where:{videoId},
        data:{
            processingStatus
        }
    })
}
export async function listVideo(){
    return prisma.video.findMany({
        orderBy:{
             createdAt:'desc'
        }
    })
}
export async function getVideoByID(videoId:string){
    return await prisma.video.findUnique({
        where:{videoId}
    })
}