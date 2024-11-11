import { useEffect, useState } from "react";
import { socket } from "../../config/socket.client";
import { channel, peerConnection } from "../../config/peerconnection.client";

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
    HandleSendMessage,
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
    remoteAudioElement,
}) => {
    const [data] = event.streams;

    if (remoteVideoElement && remoteVideoElement.current)
        remoteVideoElement.current.srcObject = data;

    if (remoteAudioElement && remoteAudioElement.current) {
        remoteAudioElement.current.srcObject = data;
    }
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

const setStream: SetStream = async ({
    localVideoElement,
    localAudioElement,
}) => {
    const localStream = await getStream();
    if (localVideoElement.current) {
        localVideoElement.current.srcObject = localStream;
    }

    if (localAudioElement.current) {
        localAudioElement.current.srcObject = localStream;
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

const handleSendMessage: HandleSendMessage = ({ message, setMessage }) => {
    if (!message) return;

    setMessage((prev) => [...prev, message]);

    channel.send(message);
};

export const useWebRTC: UseWebRTC = ({
    roomId,
    remoteVideoElement,
    remoteAudioElement,
}) => {
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
            handleRemoteTrack({
                event,
                remoteVideoElement,
                remoteAudioElement,
            });

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
        socket.on("new-user", (res) => console.log(res));

        return () => {
            socket.off("new-user");
            socket.off("join-room");
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("ice-candidate", handleIceCandidate);
        };
    }, [roomId]);

    return { messages, setMessage };
};

export const webRTC = {
    setStream,
    handleCall,
    handleSendMessage,
};
