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

    const messageElement = useRef<HTMLInputElement>(null);

    const { messages, setMessage } = useWebRTC({ roomId, remoteVideoElement });

    return (
        <main className="flex">
            <div className="w-2/3">
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
            </div>
            <div className="1/3">
                <div>{messages && messages.map((ele) => <div>{ele}</div>)}</div>
                <div>
                    <input type="text" ref={messageElement} />
                    <button
                        onClick={() => {
                            webRTC.handleSendMessage({
                                message: messageElement.current?.value,
                                setMessage,
                            });
                        }}
                    >
                        send Message
                    </button>
                </div>
            </div>
        </main>
    );
}
