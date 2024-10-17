import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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

    const localAudioElement = useRef<HTMLAudioElement>(null);
    const remoteAudioElement = useRef<HTMLAudioElement>(null);

    const messageElement = useRef<HTMLInputElement>(null);

    const { messages, setMessage } = useWebRTC({
        roomId,
        remoteVideoElement,
        remoteAudioElement,
    });

    return (
        <main className="flex">
            <div className="w-2/3">
                <h1>video call</h1>

                <video ref={localVideoElement} autoPlay></video>
                <audio ref={localAudioElement} autoPlay controls></audio>
                <video ref={remoteVideoElement} autoPlay></video>
                <audio ref={remoteAudioElement} autoPlay></audio>

                <Button
                    onClick={() =>
                        webRTC.setStream({
                            localVideoElement,
                            localAudioElement,
                        })
                    }
                >
                    Get video and audio
                </Button>

                <Button
                    onClick={() =>
                        webRTC.handleCall({
                            roomId,
                        })
                    }
                >
                    Join call
                </Button>
            </div>
            <div className="1/3">
                <div>{messages && messages.map((ele) => <div>{ele}</div>)}</div>
                <div>
                    <Input
                        type="text"
                        ref={messageElement}
                        placeholder="Type something..."
                    />

                    <Button
                        onClick={() =>
                            webRTC.handleSendMessage({
                                message: messageElement.current?.value,
                                setMessage,
                            })
                        }
                    >
                        send Message
                    </Button>
                </div>
            </div>
        </main>
    );
}
