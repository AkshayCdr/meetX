export const peerConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
            ],
        },
    ],
};

export const peerConnection = new RTCPeerConnection(peerConfiguration);

export const channel = peerConnection.createDataChannel("chat");
