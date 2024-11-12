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
    console.log(params);

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
    socketId: string,
    event: RTCPeerConnectionIceEvent,
    userId: string
) => {
    console.log("sending ice candidate ");
    if (event.candidate) {
        debugger;
        return socket.emit("ice-candidate", event.candidate, socketId, userId);
    }
    console.log("not ice candidate to emit ");
};

const handleIceCadidate = (
    icecandidate: RTCIceCandidate,
    socketId: string,
    userId: string
) => {
    const peerConnection = rtcConnections.get(userId);

    peerConnection?.addIceCandidate(icecandidate);
    console.log("set Ice candidate");
};

const handleOnTrack = (userId: string, event: RTCTrackEvent) => {
    const [data] = event.streams;
    const element = refs.get(userId);
    if (element && element.current) {
        element.current.srcObject = data;
    }
};

const createOfferAndSend = (
    peerconnection: RTCPeerConnection,
    userId: string
) => {
    peerconnection
        .createOffer()
        .then((offer) => {
            peerconnection.setLocalDescription(offer);
            return offer;
        })
        .then((offer) => {
            socket.emit("offer", offer, userId);
        });
};

const setPeerConnections = (peers: Peers, roomId: string) => {
    if (peers.size === 0) return;
    console.log("inside peers");
    // debugger;
    peers.forEach((peer) => {
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
                handleOnIceCandidate(peer.socketId, event, peer.userId);
        };

        peerConnection.ontrack = (event) => handleOnTrack(userId, event);

        //create offer // emit offer
        createOfferAndSend(peerConnection, peer.userId);
    });
};

export default function videoCall() {
    const roomId = useLoaderData<string>();
    const [peers, setPeers] = useState<Peers>(new Map());

    console.log(peers);

    const localvideo = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        //join room

        // socket.connect();
        socket.emit("join-room", roomId);

        const handlePeers = (peers: string) => {
            // console.log("peers are");
            // console.log(peers);
            const data = JSON.parse(peers);

            // console.log(data);

            const map: Peers = new Map(data);

            setPeers(map);
            setPeerConnections(map, roomId);
        };

        const handleNewUSer = (newUserDetails: User) => {
            setPeers((prev) => {
                const updatedPeers = new Map(prev).set(
                    newUserDetails.userId,
                    newUserDetails
                );
                setPeerConnections(updatedPeers);
                return updatedPeers;
            });
        };

        socket.on("peers", handlePeers);
        socket.on("new-user", handleNewUSer);
        socket.on("ice-candidate", handleIceCadidate);
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
                        <video ref={refs.get(user.userId)} src=""></video>
                    </div>
                ))}
        </main>
    );
}

//for each person create a remote video
