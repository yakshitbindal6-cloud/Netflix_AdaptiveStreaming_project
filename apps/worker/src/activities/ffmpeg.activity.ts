import path from 'path';
import { config } from '../config';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(config.ffmpegPath);
ffmpeg.setFfprobePath(config.ffprobePath);

function resolveMediaPath(relativePath: string): string {
    const normalizedPath = relativePath.replace(/^\/+/, ''); // Remove leading slashes
    const resolvedAbsolutePath = path.resolve(config.mediaRoot, normalizedPath);
    return resolvedAbsolutePath;
}