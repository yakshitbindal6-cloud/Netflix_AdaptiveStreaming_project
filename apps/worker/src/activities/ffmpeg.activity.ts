import path from 'path';
import { config } from '../config';
import ffmpeg from 'fluent-ffmpeg';
import { Resolution } from '@adaptive-streaming/shared';
import fs from 'fs/promises'
ffmpeg.setFfmpegPath(config.ffmpegPath);
ffmpeg.setFfprobePath(config.ffprobePath);

function resolveMediaPath(relativePath: string): string {
    const normalizedPath = relativePath.replace(/^\/+/, ''); // Remove leading slashes
    const resolvedAbsolutePath = path.resolve(config.mediaRoot, normalizedPath);
    const root_path=path.resolve(config.mediaRoot)
    if(resolvedAbsolutePath===root_path||!resolvedAbsolutePath.startsWith(`${root_path}${path.sep}`))throw new Error(`invalid media path:${relativePath}`);
    return resolvedAbsolutePath;
}
export async function transcodeResolution(
    inputRelativepath:string,
    outputRelativepath:string,
    resolution :Resolution
){
    const inputpath=resolveMediaPath(inputRelativepath);
    const outputpath=resolveMediaPath(outputRelativepath);
    const varientoutput=`${outputpath}${path.sep}${resolution.label}`
    const varientPlaylist=`${varientoutput}${path.sep}playlist.m3u8`
    await fs.mkdir(varientoutput,{recursive:true})

    await new Promise((resolve,rejected)=>{
        ffmpeg(inputpath)
        .outputOption([
            `-vf scale=${resolution.width}:${resolution.height}`,
            `-b:v ${resolution.bitrate}`,
            '-codec:v libx264',
            '-codec:a aac',
            '-hls_time 10',
            '-hls_playlist_type vod',
            `-hls_segment_filename ${path.join(varientoutput,'segment-%05d.ts')}`
        ])
        .output(varientPlaylist)
        .on('end',()=>{
            console.log(`transcode ${inputpath} to ${varientPlaylist}`)
            resolve(true);
        })
        .on('error',(err)=>{
             console.log(`error transcode ${inputpath} : ${err.message}`)
             rejected(err);
        })
        .run()
    })
    return `EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitrate*1000},RESOLUTION=${resolution.width}x${resolution.height}\n${resolution.label}/playlist.m3u8\n`
}
export async function writeMasterPlaylist(
    outputRelativepath:string,
    Resolution_entries:string[]
){
    const outputpath=resolveMediaPath(outputRelativepath);
    const masterPlaylistPath=`${outputpath}${path.sep}master.m3u8`
    await fs.mkdir(outputpath,{recursive:true})
    await fs.writeFile(masterPlaylistPath,`#EXTM3U\n${Resolution_entries.join('\n')}`)
    return `${outputRelativepath}${path.sep}master.m3u8`
}
export async function DeleteSorcefile(inputRelativepath:string){
    const inputpath=resolveMediaPath(inputRelativepath);
    const exists=await fs.access(inputpath).then(()=>true).catch(()=>false)
    if(exists){
        await fs.unlink(inputpath)
    }
}