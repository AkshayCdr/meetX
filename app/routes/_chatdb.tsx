import { Outlet } from "@remix-run/react";

export default function ChatLayout() {
    return (
        <>
            <main>
                <Outlet />
            </main>
        </>
    );
}
