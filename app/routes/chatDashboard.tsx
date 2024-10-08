import { ActionFunctionArgs, json } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Form, useActionData } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const roomId = String(formData.get("roomId"));

    console.log(roomId);
    const err = isValidRoomId(roomId);

    console.log(err);

    if (err) {
        return json(err);
    }

    return roomId;
};

type Errors = {
    empty?: boolean;
    invalid?: boolean;
};

const isValidRoomId = (roomId: string) => {
    const errors: Errors = {};
    if (!roomId) {
        errors.empty = true;
        return errors;
    }

    if (roomId.length < 3) {
        errors.invalid = true;
        return errors;
    }
    return null;
};

export default function chatDashboard() {
    const actionData = useActionData<typeof action>() as Errors;
    console.log(actionData);
    return (
        <main className="w-screen h-screen bg-green-900">
            <div className="flex flex-row items-center">
                <Form method="post">
                    <Button variant={"blue"} className="w-56 h-14">
                        New meeting
                    </Button>

                    <Input name="roomId" type="text" placeholder="roomId" />
                    {actionData?.empty && (
                        <label className="text-red-700">Obj is empty</label>
                    )}
                    {actionData?.invalid && (
                        <label className="text-red-700">Obj is invalid</label>
                    )}
                    <Button type="submit">Join</Button>
                </Form>
            </div>
        </main>
    );
}
