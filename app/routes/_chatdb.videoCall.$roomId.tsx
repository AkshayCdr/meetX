import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { socket } from "../../config/socket.client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useWebRTC } from "~/hooks/useWebRTC";
import { webRTC } from "~/hooks/useWebRTC";
import { peerConfiguration } from "../../config/peerconnection.client";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
    // console.log(params);

    return params;
};

// type Peers = Array<User>;

type Peers = Map<string, User>;

type User = {
    name: string;
    socketId: string;
    userId: string;
};

const rtcConnections = new Map<string, RTCPeerConnection>();
const refs = new Map<string, React.RefObject<HTMLVideoElement>>();

const handleOnIceCandidate = (
    event: RTCPeerConnectionIceEvent,
    userId: string,
    roomId: string
) => {
    console.log("sending ice candidate ");
    if (event.candidate) {
        debugger;
        return socket.emit("ice-candidate", {
            iceCandidate: event.candidate,
            userId,
            roomId,
        });
    }
    // console.log("not ice candidate to emit ");
};

const handleIceCadidate = ({
    iceCandidate,
    userId,
}: {
    iceCandidate: RTCIceCandidate;
    userId: string;
}) => {
    const peerConnection = rtcConnections.get(userId);

    peerConnection?.addIceCandidate(iceCandidate);
    // console.log("set Ice candidate");
};

const handleOnTrack = (userId: string, event: RTCTrackEvent) => {
    const [data] = event.streams;
    const element = refs.get(userId);
    if (element && element.current) {
        element.current.srcObject = data;
    }
};

const createOfferAndSend = async (
    peerconnection: RTCPeerConnection,
    userId: string,
    roomId: string
) => {
    const offer = await peerconnection.createOffer();

    await peerconnection.setLocalDescription(offer);

    if (!roomId) return;
    socket.emit("offer", { offer, userId, roomId });
};

const setPeerConnections = async (peers: Peers, roomId: string) => {
    if (peers.size === 0) return;
    // onsole.log("inside peers");
    // debugger;
    peers.forEach(async (peer) => {
        if (rtcConnections.has(peer.userId)) return;

        const peerConnection = new RTCPeerConnection(peerConfiguration);
        const userId = peer.userId;
        //setting peer for each item
        rtcConnections.set(userId, peerConnection);
        //setting ref
        refs.set(userId, React.createRef<HTMLVideoElement>());

        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((localstream) => {
                localstream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localstream);
                });
            });

        peerConnection.onicecandidate = (event) => {
            debugger;
            if (event.candidate)
                handleOnIceCandidate(event, peer.userId, roomId);
        };

        peerConnection.ontrack = (event) => handleOnTrack(userId, event);

        //create offer // emit offer
        await createOfferAndSend(peerConnection, peer.userId, roomId);
    });
};

export default function videoCall() {
    const { roomId } = useLoaderData<{ roomId: string }>();
    const [peers, setPeers] = useState<Peers>(new Map());

    // console.log(peers);
    console.log(roomId);

    const localvideo = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        //join room

        // socket.connect();
        socket.emit("join-room", { roomId });

        const handlePeers = async (peers: string) => {
            // console.log("peers are");
            // console.log(peers);
            const data = JSON.parse(peers);

            // console.log(data);

            const map: Peers = new Map(data);

            setPeers(map);
            await setPeerConnections(map, roomId);
        };

        const handleNewUSer = (newUserDetails: User) => {
            setPeers((prev) => {
                const updatedPeers = new Map(prev).set(
                    newUserDetails.userId,
                    newUserDetails
                );
                setPeerConnections(updatedPeers, roomId);
                return updatedPeers;
            });
        };

        const handleAnswer = ({
            userId,
            answer,
        }: {
            userId: string;
            answer: RTCSessionDescriptionInit;
        }) => {
            if (!answer) return;

            const peerConnection = rtcConnections.get(userId);
            if (!peerConnection) return;

            peerConnection
                .setRemoteDescription(new RTCSessionDescription(answer))
                .then(() => {
                    console.log("set remote answer");
                });
        };

        const handleOffer = ({
            offer,
            userId,
        }: {
            offer: RTCSessionDescriptionInit;
            userId: string;
        }) => {
            const peerConnection = rtcConnections.get(userId);
            if (!peerConnection) return;
            peerConnection
                .setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => peerConnection.createAnswer())
                .then((answer) => {
                    peerConnection.setLocalDescription(answer);
                    return answer;
                })
                .then((answer) => {
                    socket.emit("answer", { userId, roomId, answer });
                });
        };

        socket.on("peers", handlePeers);
        socket.on("new-user", handleNewUSer);
        socket.on("ice-candidate", handleIceCadidate);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        //get offer set answer

        return () => {
            socket.off("peers", handlePeers);
            socket.off("new-user", handleNewUSer);
            socket.off("ice-candidate", handleIceCadidate);
        };
        //each peer webrtc connection
    }, []);

    return (
        <main className="flex">
            <video ref={localvideo} src=""></video>

            {peers.size > 0 &&
                [...peers.entries()].map(([id, user]) => (
                    <div key={id}>
                        <h1>{user.name}</h1>
                        <video
                            ref={refs.get(user.userId)}
                            src=""
                            autoPlay
                            playsInline
                        ></video>
                    </div>
                ))}
        </main>
    );
}

//for each person create a remote video
