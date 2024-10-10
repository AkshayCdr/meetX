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

    const localVideoElement = useRef<HTMLVideoElement>(null);
    const remoteVideoElement = useRef<HTMLVideoElement>(null);

    const { messages } = useWebRTC({ roomId, remoteVideoElement });

    return (
        <main>
            <h1>video call</h1>

            <video ref={localVideoElement} autoPlay></video>
            <video ref={remoteVideoElement} autoPlay></video>

            <button onClick={() => webRTC.setStream(localVideoElement)}>
                Get video
            </button>

            <button
                onClick={() =>
                    webRTC.handleCall({
                        roomId,
                    })
                }
            >
                Join call
            </button>

            {messages && messages.map((ele) => <div>{ele}</div>)}
        </main>
    );
}
