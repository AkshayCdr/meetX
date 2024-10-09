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

    return params;
};

const getStream = async () => {
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
};

type HandleCallArgs = {
    peerConnection: RTCPeerConnection;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
    roomId: string;
};
const handleCall = async ({
    peerConnection,
    remoteVideoElement,
    roomId,
}: HandleCallArgs) => {
    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", { offer, roomId });

    peerConnection.onicecandidate = (e) => handleRemoteIceCandidate(e, roomId);
    peerConnection.ontrack = (e) =>
        handleRemoteTrack({ e, remoteVideoElement });
};

const handleRemoteIceCandidate = (
    e: RTCPeerConnectionIceEvent,
    roomId: string
) => {
    if (e.candidate) {
        //emit ice candidate
        socket.emit("ice-candidate", { ice: e.candidate, roomId });
    }
};

type HandleRemoteTrack = {
    e: RTCTrackEvent;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
};

const handleRemoteTrack = ({ e, remoteVideoElement }: HandleRemoteTrack) => {
    const [data] = e.streams;

    if (remoteVideoElement && remoteVideoElement.current)
        remoteVideoElement.current.srcObject = data;
};

export default function videoCall() {
    const roomId = useLoaderData<string>();

    const locaVideoElement = useRef<HTMLVideoElement>(null);
    const remoteVideoElement = useRef<HTMLVideoElement>(null);

    const peerConnection = new RTCPeerConnection(peerConfiguration);

    getStream()
        .then((tracks) => tracks.getTracks())
        .then((res) => res.forEach((track) => peerConnection.addTrack(track)));

    const setStream = async () => {
        if (locaVideoElement.current) {
            locaVideoElement.current.srcObject = await getStream();
        }
    };

    useEffect(() => {
        socket.connect();
        socket.emit("join-room", roomId);

        socket.on("offer", async (offer) => {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("answer", { answer, roomId });
        });

        socket.on("answer", async (answer) => {
            if (!answer) return;
            await peerConnection.setRemoteDescription(answer);
        });

        socket.on("ice-candidate", async (ice) => {
            if (!ice) return;
            await peerConnection.addIceCandidate(ice);
        });

        return () => {
            socket.off("join-room");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
        };
    });

    return (
        <main>
            <h1>video call</h1>

            <video ref={locaVideoElement} autoPlay></video>
            <video ref={remoteVideoElement} autoPlay></video>

            <button onClick={setStream}>Get video </button>

            <button
                onClick={() =>
                    handleCall({
                        peerConnection,
                        remoteVideoElement,
                        roomId,
                    })
                }
            >
                call
            </button>
        </main>
    );
}
