import {create_videoRecord,listVideo,getVideoByID}from '../repository/video_repo'

export async function createRecord_service(videoId:string,originalFileName:string){
    return await create_videoRecord(videoId,originalFileName);
}
export async function get_videoByID_service(videoId:string){
    return await getVideoByID(videoId);
}
export async function list_videoRecord_service(){
    return await listVideo();
}