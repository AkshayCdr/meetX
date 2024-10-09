import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { socket } from "../../config/socket.client";
import { useEffect, useRef } from "react";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
    console.log(params);

    return null;
};

const getStream = async () => {
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
};

export default function videoCall() {
    const data = useLoaderData();

    const videElement = useRef<HTMLVideoElement>(null);

    const setStream = async () => {
        if (videElement?.current) {
            videElement.current.srcObject = await getStream();
        }
    };

    useEffect(() => {
        socket.connect();

        socket.emit("join-room", data);
    });

    return (
        <main>
            <h1>video call</h1>

            <video ref={videElement} autoPlay></video>

            <button onClick={setStream}>Get video </button>
        </main>
    );
}

// function Video({srcObj}){
//     return <video src></video>
// }
