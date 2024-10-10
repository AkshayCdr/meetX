import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { useRef } from "react";
import { useWebRTC } from "~/hooks/useWebRTC";

import { webRTC } from "~/hooks/useWebRTC";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
    console.log(params);

    return params;
};

export default function videoCall() {
    const roomId = useLoaderData<string>();

    const locaVideoElement = useRef<HTMLVideoElement>(null);
    const remoteVideoElement = useRef<HTMLVideoElement>(null);

    useWebRTC({ roomId, remoteVideoElement });

    return (
        <main>
            <h1>video call</h1>

            <video ref={locaVideoElement} autoPlay></video>
            <video ref={remoteVideoElement} autoPlay></video>

            <button onClick={() => webRTC.setStream(locaVideoElement)}>
                Get video
            </button>

            <button
                onClick={() =>
                    webRTC.handleCall({
                        roomId,
                    })
                }
            >
                call
            </button>
        </main>
    );
}
