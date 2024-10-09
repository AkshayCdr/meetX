import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { socket } from "../../config/socket.client";
import { useEffect, useRef } from "react";

const peerConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
            ],
        },
    ],
};

export const loader = ({ request, params }: LoaderFunctionArgs) => {
    console.log(params);

    return null;
};

const getStream = async () => {
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
};

const handleCall = () => {
    const peerConnection = new RTCPeerConnection(peerConfiguration);
    peerConnection.onicecandidate = handleRemoteIceCandidate;
    peerConnection.ontrack = handleRemoteTrack;
};

const handleRemoteIceCandidate = () => {};
const handleRemoteTrack = () => {};

export default function videoCall() {
    const data = useLoaderData();

    const videElement1 = useRef<HTMLVideoElement>(null);
    const videElement2 = useRef<HTMLVideoElement>(null);

    const setStream = async () => {
        if (videElement1?.current) {
            videElement1.current.srcObject = await getStream();
        }
    };

    useEffect(() => {
        socket.connect();
        socket.emit("join-room", data);

        return () => {
            socket.off("join-room");
        };
    });

    return (
        <main>
            <h1>video call</h1>

            <video ref={videElement1} autoPlay></video>
            <video ref={videElement2} autoPlay></video>

            <button onClick={setStream}>Get video </button>

            <button onClick={handleCall}>call</button>
        </main>
    );
}
