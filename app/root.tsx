import { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
];

export default function App() {
    return (
        <html>
            <head>
                <link rel="icon" href="data:image/x-icon;base64,AA" />
                <Meta />
                <Links />
            </head>
            <body>
                <section className="bg-slate-500 w-fit h-fit">
                    <h1 className="text-3xl font-bold underlined ">
                        Hello world!
                    </h1>
                </section>
                <Outlet />

                <Scripts />
            </body>
        </html>
    );
}
