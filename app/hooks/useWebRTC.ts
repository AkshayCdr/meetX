import { useEffect, useState } from "react";
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
    HandleMessage,
    HandleRemoteDataChannel,
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

const handleRemoteIceCandidate: HandleRemoteIceCandidate = ({
    event,
    roomId,
}) => {
    if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, roomId);
    }
};

const handleRemoteTrack: HandleRemoteTrack = ({
    event,
    remoteVideoElement,
}) => {
    const [data] = event.streams;

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

const handleMessage: HandleMessage = ({ event, setMessage }) => {
    console.log(event.data);

    setMessage((prev) => [...prev, event.data]);
};

const handleRemoteDataChannel: HandleRemoteDataChannel = ({
    event,
    setMessage,
}) => {
    const channel = event.channel;

    channel.onmessage = (event) => handleMessage({ event, setMessage });
};

export const useWebRTC: UseWebRTC = ({ roomId, remoteVideoElement }) => {
    const [messages, setMessage] = useState<Array<string>>([]);

    useEffect(() => {
        getStream().then((localStream) => {
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
        });

        peerConnection.onicecandidate = (event) =>
            handleRemoteIceCandidate({ event, roomId });

        peerConnection.ontrack = (event) =>
            handleRemoteTrack({ event, remoteVideoElement });

        const channel = peerConnection.createDataChannel("chat");

        channel.onmessage = (event) => handleMessage({ event, setMessage });

        channel.onopen = () => {
            if (channel.readyState === "open") channel.send("hai");
        };

        peerConnection.ondatachannel = (event) =>
            handleRemoteDataChannel({ event, setMessage });

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
    }, [roomId]);

    return { messages };
};

export const webRTC = {
    setStream,
    handleCall,
};
