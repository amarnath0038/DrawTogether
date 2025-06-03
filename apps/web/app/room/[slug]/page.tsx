import { RoomCanvas } from "../.././components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        slug: string
    }
}) {
    const roomId = (await params).slug;

    return <RoomCanvas roomId={roomId} />
   
}


