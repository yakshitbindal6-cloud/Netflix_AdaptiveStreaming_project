import {prisma} from "../lib/prisma";
import { ProcessingStatus } from "@adaptive-streaming/shared"

export async function updateVideoStatus(videoId:string, processingStatus :ProcessingStatus){
    await prisma.video.update({
        where:{videoId},
        data:{processingStatus}
    })
}
