import fs from "fs";
import path from "path";
import { config } from "../config";

export function ensureMediaDirectoryExists(){
    const dirs=[
        path.join(config.mediaRoot,'uploads'),
        path.join(config.mediaRoot,'output')
    ]
    for(const dir of dirs){
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir,{recursive:true})
        }
    }
}
export function getUploadDirectory(){
    return path.join(config.mediaRoot,"uploads");
}
export function getOutputDirectory(videoId:string){
    return path.join(config.mediaRoot,"output",videoId);
}
export function getOutputRelativepath(videoId:string){
    return `output/${videoId}`
}
export function getOutputRelativePath(absolutePath:string){
    const relative_path= path.relative(path.resolve(config.mediaRoot),path.resolve(absolutePath));
    if(relative_path.startsWith('..') || path.isAbsolute(relative_path))throw new Error(`ivalide path`);
    return relative_path.split(path.sep).join("/");
}