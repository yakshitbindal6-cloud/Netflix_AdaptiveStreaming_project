import { Connection,Client } from "@temporalio/client";
import {config} from './index'
let client:Client|null=null;

export async function getTemporalClient(){
    if(client)return client
    const connection=await Connection.connect({
        address:config.temporalAddress
    });
    client=new Client({
        connection,
        namespace:'default'
    })
    return client;
}
export async function disconnectTemporal() {
    if(client) {
        await client.connection.close();
        client = null;
    }
}