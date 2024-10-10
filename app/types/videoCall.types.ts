export type HandleCall = (args: { roomId: string }) => Promise<void>;

export type HandleRemoteIceCandidate = (args: {
    event: RTCPeerConnectionIceEvent;
    roomId: string;
}) => void;

export type HandleRemoteTrack = (args: {
    event: RTCTrackEvent;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
    remoteAudioElement: React.RefObject<HTMLAudioElement>;
}) => void;

export type HandleOffer = (args: {
    offer: RTCSessionDescriptionInit;
    roomId: string;
}) => void;

export type HandleAnswer = (answer: RTCSessionDescriptionInit) => void;

export type HandleIceCandidate = (ice: RTCIceCandidate) => void;

export type SetStream = (args: {
    localVideoElement: React.RefObject<HTMLVideoElement>;
    localAudioElement: React.RefObject<HTMLAudioElement>;
}) => void;

export type HandleMessage = (args: {
    event: MessageEvent<string>;
    setMessage: React.Dispatch<React.SetStateAction<string[]>>;
}) => void;

export type HandleRemoteDataChannel = (args: {
    event: RTCDataChannelEvent;
    setMessage: React.Dispatch<React.SetStateAction<string[]>>;
}) => void;

export type HandleSendMessage = (args: {
    message: string | undefined;
    setMessage: React.Dispatch<React.SetStateAction<string[]>>;
}) => void;

export type UseWebRTC = (args: {
    roomId: string;
    remoteVideoElement: React.RefObject<HTMLVideoElement>;
    remoteAudioElement: React.RefObject<HTMLAudioElement>;
}) => {
    messages: Array<string>;
    setMessage: React.Dispatch<React.SetStateAction<string[]>>;
};
