import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, useActionData } from "@remix-run/react";

export const loader = () => {
    return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const intent = String(formData.get("intent"));

    const isNewMeeting = intent === "new";
    const isJoinMeet = intent === "submit";

    const roomId = String(formData.get("roomId"));

    const err = isValidRoomId(roomId);
    if (err) return json(err);

    return redirect(`/videoCall/${roomId}`);
};

type Errors = {
    empty?: boolean;
    invalid?: boolean;
};

const isValidRoomId = (roomId: string) => {
    const errors: Errors = {};
    if (!roomId) errors.empty = true;

    if (roomId.length < 3) errors.invalid = true;

    if (Object.keys(errors).length) return errors;
    return null;
};

export default function chat() {
    const actionData = useActionData<typeof action>() as Errors;

    return (
        <main className="w-screen h-screen bg-green-900">
            <div className="flex flex-row items-center">
                <Form method="post">
                    <Button
                        variant={"blue"}
                        className="w-56 h-14"
                        name="intent"
                        value="new"
                    >
                        New meeting
                    </Button>

                    <Input name="roomId" type="text" placeholder="roomId" />

                    {actionData?.empty && (
                        <label className="text-red-700">Obj is empty</label>
                    )}

                    {actionData?.invalid && (
                        <label className="text-red-700">Obj is invalid</label>
                    )}

                    <Button type="submit" name="intent" value="submit">
                        Join
                    </Button>
                </Form>
            </div>
        </main>
    );
}
