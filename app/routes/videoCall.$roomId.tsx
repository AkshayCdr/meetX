import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { socket } from "../../config/socket.client";
import { useEffect, useRef } from "react";
import { peerConnection } from "../../config/peerconnection.client";

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

type HandleCall = (args: {
    peerConnection: RTCPeerConnection;
    roomId: string;
}) => Promise<void>;

const handleCall: HandleCall = async ({ peerConnection, roomId }) => {
    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", offer, roomId);
};

type HandleRemoteIceCandidate = (args: {
    e: RTCPeerConnectionIceEvent;
    roomId: string;
}) => void;

const handleRemoteIceCandidate: HandleRemoteIceCandidate = ({ e, roomId }) => {
    if (e.candidate) {
        socket.emit("ice-candidate", e.candidate, roomId);
    }
};

type HandleRemoteTrack = (args: {
    e: RTCTrackEvent;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
}) => void;

const handleRemoteTrack: HandleRemoteTrack = ({ e, remoteVideoElement }) => {
    const [data] = e.streams;

    if (remoteVideoElement && remoteVideoElement.current)
        remoteVideoElement.current.srcObject = data;
};

type HandleOffer = (args: {
    offer: RTCSessionDescriptionInit;
    roomId: string;
}) => void;

const handleOffer: HandleOffer = async ({ offer, roomId }) => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomId);
};

const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!answer) return;
    await peerConnection.setRemoteDescription(answer);
};

const handleIceCandidate = async (ice: RTCIceCandidate) => {
    if (!ice) return;
    await peerConnection.addIceCandidate(ice);
};

const setStream = async (
    locaVideoElement: React.RefObject<HTMLVideoElement>
) => {
    if (locaVideoElement.current) {
        locaVideoElement.current.srcObject = await getStream();
    }
};

export default function videoCall() {
    const roomId = useLoaderData<string>();

    const locaVideoElement = useRef<HTMLVideoElement>(null);
    const remoteVideoElement = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        (async () => {
            const localStream = await getStream();
            for (const track of localStream.getTracks()) {
                peerConnection.addTrack(track, localStream);
            }
        })();

        peerConnection.onicecandidate = (e) =>
            handleRemoteIceCandidate({ e, roomId });

        peerConnection.ontrack = (e) =>
            handleRemoteTrack({ e, remoteVideoElement });

        socket.connect();
        socket.emit("join-room", roomId);

        socket.on("offer", (offer) => handleOffer({ offer, roomId }));
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("join-room");
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("ice-candidate", handleIceCandidate);
        };
    });

    return (
        <main>
            <h1>video call</h1>

            <video ref={locaVideoElement} autoPlay></video>
            <video ref={remoteVideoElement} autoPlay></video>

            <button onClick={() => setStream(locaVideoElement)}>
                Get video
            </button>

            <button
                onClick={() =>
                    handleCall({
                        peerConnection,
                        roomId,
                    })
                }
            >
                call
            </button>
        </main>
    );
}
