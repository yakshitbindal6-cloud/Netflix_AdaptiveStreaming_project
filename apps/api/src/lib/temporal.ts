import {config} from '../config/index'
import { getTemporalClient } from '../config/temporal_client'
import { videoinput } from '@adaptive-streaming/shared'
import {Process_video_workflow} from "@adaptive-streaming/shared"      
async function startworkflow(workflowName:string,workflowId:string,arg:unknown[],task_queue:string){
    try{
       const client = await Promise.race([
            getTemporalClient(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('temporal client connection timeout')), 5000))
        ]);
        const handle=await client.workflow.start(workflowName,{
            taskQueue:task_queue,
            workflowId,
            args:arg
        });
        return handle.workflowId;
    }catch(err){
        console.error(`[temporal] error starting workflow:${workflowName} with id:${workflowId}, error:${err}`);
        return null;
    }
}
export async function StartVideoProcessingWorkflow(input:videoinput){
    return startworkflow(
        Process_video_workflow,
        `video-processing-${input.videoId}`,
        [input],
        config.temporalTaskQueue
    )
}