import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticate } from "~/utils/authenticate";

export const description =
    "A simple login form with email and password. The submit button says 'Sign in'.";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    //validation
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    //send to backend
    const [res, err] = await authenticate({ email, password });

    if (err) return null;
    if (!res) return null;

    const token = String(res.headers.get("set-cookie"));

    if (!token) return null;

    return redirect("/chat", {
        headers: {
            "Set-Cookie": token,
        },
    });
};

export default function Login() {
    return (
        <Form className="flex justify-center items-center" method="post">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Sign in</Button>
                </CardFooter>
            </Card>
        </Form>
    );
}
