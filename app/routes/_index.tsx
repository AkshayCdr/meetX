import { Link } from "@remix-run/react";

export default function Home() {
    return (
        <div>
            '
            <ul>
                <li>
                    <Link to={"/login"}>Login</Link>
                    <Link to={"/signup"}>Sign Up</Link>
                </li>
            </ul>
        </div>
    );
}
