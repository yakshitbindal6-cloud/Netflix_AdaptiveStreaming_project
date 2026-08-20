import { proxyActivities} from "@temporalio/workflow";
import type * as activities from "../activities";
import { videoinput,RESOLUTIONS } from "@adaptive-streaming/shared";
const {transcodeResolution,writeMasterPlaylist,DeleteSorcefile,updateVideoStatus}=proxyActivities<typeof activities>({
    retry: {maximumAttempts: 3},
    startToCloseTimeout: "1 hour",
})
export async function VideoProcessingWorkflow(input:videoinput){
    const {videoId,inputRelativepath,outputRelativepath}=input
    try{
        await updateVideoStatus(videoId,"processing")
        const resolutionEntries= await Promise.all(
            RESOLUTIONS.map((res)=>transcodeResolution(inputRelativepath,outputRelativepath,res))
        )// todo: handle each resolution by seperate worker
        const masterplaylistRelativePath=await writeMasterPlaylist(outputRelativepath,resolutionEntries);
        await DeleteSorcefile(inputRelativepath);
        await updateVideoStatus(videoId,"completed");
    }
    catch(err){
        await updateVideoStatus(videoId,"failed");
        throw err;
    }
}