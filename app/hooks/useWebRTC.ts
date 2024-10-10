import { useEffect } from "react";
import { socket } from "../../config/socket.client";
import { peerConnection } from "../../config/peerconnection.client";

import {
    HandleCall,
    HandleRemoteIceCandidate,
    HandleRemoteTrack,
    HandleOffer,
    HandleAnswer,
    HandleIceCandidate,
    SetStream,
    UseWebRTC,
} from "~/types/videoCall.types";

const getStream = async () => {
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
};

const handleCall: HandleCall = async ({ roomId }) => {
    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", offer, roomId);
};

const handleRemoteIceCandidate: HandleRemoteIceCandidate = ({ e, roomId }) => {
    if (e.candidate) {
        socket.emit("ice-candidate", e.candidate, roomId);
    }
};

const handleRemoteTrack: HandleRemoteTrack = ({ e, remoteVideoElement }) => {
    const [data] = e.streams;

    if (remoteVideoElement && remoteVideoElement.current)
        remoteVideoElement.current.srcObject = data;
};

const handleOffer: HandleOffer = async ({ offer, roomId }) => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomId);
};

const handleAnswer: HandleAnswer = async (answer) => {
    if (!answer) return;
    await peerConnection.setRemoteDescription(answer);
};

const handleIceCandidate: HandleIceCandidate = async (ice) => {
    if (!ice) return;
    await peerConnection.addIceCandidate(ice);
};

const setStream: SetStream = async (locaVideoElement) => {
    if (locaVideoElement.current) {
        locaVideoElement.current.srcObject = await getStream();
    }
};

export const useWebRTC: UseWebRTC = ({ roomId, remoteVideoElement }) => {
    useEffect(() => {
        getStream().then((localStream) => {
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
        });

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
    }, []);
};

export const webRTC = {
    setStream,
    handleCall,
};
