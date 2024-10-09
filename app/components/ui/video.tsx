type VideoArgs = {
    size: { height: string; width: string };
};

export default function video({ size }: VideoArgs) {
    return <div>video</div>;
}
