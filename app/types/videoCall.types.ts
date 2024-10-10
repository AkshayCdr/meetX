export type HandleCall = (args: { roomId: string }) => Promise<void>;

export type HandleRemoteIceCandidate = (args: {
    e: RTCPeerConnectionIceEvent;
    roomId: string;
}) => void;

export type HandleRemoteTrack = (args: {
    e: RTCTrackEvent;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
}) => void;

export type HandleOffer = (args: {
    offer: RTCSessionDescriptionInit;
    roomId: string;
}) => void;

export type HandleAnswer = (answer: RTCSessionDescriptionInit) => void;

export type HandleIceCandidate = (ice: RTCIceCandidate) => void;

export type SetStream = (element: React.RefObject<HTMLVideoElement>) => void;

export type UseWebRTC = (args: {
    roomId: string;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
}) => { messages: Array<string> };
