import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
export default function chatDashboard() {
    return (
        <main className="w-screen h-screen bg-green-900">
            <div className="flex flex-row items-center">
                <Button variant={"blue"} className="w-56 h-14">
                    New meeting
                </Button>

                <Input type="email" placeholder="Email" />
                <Button type="submit">Subscribe</Button>
            </div>
        </main>
    );
}
