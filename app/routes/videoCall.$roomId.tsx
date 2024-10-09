import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { socket } from "../../config/socket.client";
import { useEffect, useRef } from "react";
import { peerConnection } from "../../config/peerconnection.client";
// const peerConnection = new RTCPeerConnection(peerConfiguration);

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
    roomId: string;
};
const handleCall = async ({ peerConnection, roomId }: HandleCallArgs) => {
    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", offer, roomId);
};

const handleRemoteIceCandidate = (
    e: RTCPeerConnectionIceEvent,
    roomId: string
) => {
    if (e.candidate) {
        //emit ice candidate
        socket.emit("ice-candidate", e.candidate, roomId);
    }
};

type HandleRemoteTrack = {
    e: RTCTrackEvent;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
};

const handleRemoteTrack = ({ e, remoteVideoElement }: HandleRemoteTrack) => {
    console.log("got remote track");
    console.log(e);
    console.log(remoteVideoElement);
    console.log(e.streams);
    const [data] = e.streams;

    console.log(data);

    if (remoteVideoElement && remoteVideoElement.current)
        remoteVideoElement.current.srcObject = data;
};

export default function videoCall() {
    const roomId = useLoaderData<string>();
    console.log(roomId);

    const locaVideoElement = useRef<HTMLVideoElement>(null);
    const remoteVideoElement = useRef<HTMLVideoElement>(null);

    const setStream = async () => {
        if (locaVideoElement.current) {
            locaVideoElement.current.srcObject = await getStream();
        }
    };

    useEffect(() => {
        (async () => {
            const localStream = await getStream();
            for (const track of localStream.getTracks()) {
                peerConnection.addTrack(track, localStream);
            }
        })();

        peerConnection.onicecandidate = (e) =>
            handleRemoteIceCandidate(e, roomId);

        peerConnection.ontrack = (e) =>
            handleRemoteTrack({ e, remoteVideoElement });

        // socket.connect();
        socket.emit("join-room", roomId);

        socket.on("offer", async (offer) => {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("answer", answer, roomId);
        });

        socket.on("answer", async (answer) => {
            // if (!answer) return;
            console.log("answer is ");
            console.log(answer);
            await peerConnection.setRemoteDescription(answer);
        });

        socket.on("ice-candidate", async (ice) => {
            // if (!ice) return;
            console.log("ice candidate is ");
            console.log(ice);
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
                        roomId,
                    })
                }
            >
                call
            </button>
        </main>
    );
}
