import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createUser } from "~/utils/authenticate";

export const description =
    "A sign up form with first name, last name, email and password inside a card. There's an option to sign up with GitHub and a link to login if you already have an account";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    console.log(formData);
    //validation

    const name = formData.get("first-name") + " " + formData.get("last-name");
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const err = await createUser({ name, email, password });
    // console.log(data);
    console.log(err);

    if (err) return null;

    return redirect("/login");
};

export default function SignUp() {
    return (
        <Form className="" method="post">
            <Card className="w-full mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input
                                    id="first-name"
                                    placeholder="Max"
                                    required
                                    name="first-name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input
                                    id="last-name"
                                    placeholder="Robinson"
                                    required
                                    name="last-name"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                name="email"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Create an account
                        </Button>
                        {/* <Button variant="outline" className="w-full">
                            Sign up with GitHub
                        </Button> */}
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link to={"/login"} className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </Form>
    );
}
