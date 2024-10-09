import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
// import { socket } from "../../config/socket.client";
import { useEffect } from "react";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
    console.log(params);

    return null;
};

export default function videoCall() {
    const data = useLoaderData();

    useEffect(() => {
        // socket.connect();
    });

    return (
        <main>
            <h1>video call</h1>
        </main>
    );
}
