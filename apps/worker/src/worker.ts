import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { config } from './config';
import path from 'path'

async function run() {
  const connection = await NativeConnection.connect({
    address: config.temporalAddress,
  });
  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: config.temporalTaskQueue,
    workflowsPath: path.resolve(__dirname, "./workflows/index.js"),
    activities,
  });

  console.log(`Worker started on task queue "${config.temporalTaskQueue}"`);
  console.log(`Media root: ${config.mediaRoot}`);
  console.log(`FFmpeg: ${config.ffmpegPath}`);

  await worker.run();
}
run().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
