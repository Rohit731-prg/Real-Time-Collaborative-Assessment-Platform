import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import { Toaster } from "react-hot-toast";
import useRoomStore from "../store/RoomStore";

const Home = () => {
    const navigate = useNavigate();
    const { rooms, getRoom, joinRoom } = useRoomStore();

    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        void getRoom().finally(() => setIsLoading(false));
    }, [getRoom]);

    const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsJoining(true);
        const joined = await joinRoom(roomCode.trim());
        setIsJoining(false);

        if (joined) {
            const joinedRoomCode = roomCode.trim();
            setRoomCode("");
            setIsJoinRoomOpen(false);
            console.log(joined);
            navigate(`/roomChat/${joinedRoomCode}`);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
                            Assessment workspace
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-950">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Manage your collaborative assessment rooms and courses.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateRoomOpen(true)}
                            className="rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                        >
                            Create room
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsJoinRoomOpen(true)}
                            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                        >
                            Join room
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/course")}
                            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                        >
                            Courses
                        </button>
                    </div>
                </header>

                <section aria-labelledby="rooms-heading">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <h2 id="rooms-heading" className="text-xl font-semibold text-slate-900">
                                My rooms
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Rooms you created are listed here.
                            </p>
                        </div>
                        <span className="text-sm text-slate-500">
                            {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {isLoading ? (
                            <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">
                                Loading rooms...
                            </p>
                        ) : rooms.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="text-sm font-medium text-slate-800">
                                    No rooms yet
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Create a room for your students or join one with a room code.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] border-collapse text-left">
                                    <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Room</th>
                                            <th scope="col" className="px-5 py-3 font-semibold">Room code</th>
                                            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                                            <th scope="col" className="px-5 py-3 font-semibold">Max participants</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {rooms.map((room) => (
                                            <tr key={room._id}>
                                                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                    {room.name}
                                                </td>
                                                <td className="px-5 py-4 font-mono text-sm text-slate-700">
                                                    {room.roomCode}
                                                </td>
                                                <td className="px-5 py-4 text-sm capitalize text-slate-700">
                                                    {room.status}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {room.maxParticipants}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {isCreateRoomOpen && (
                <CreateRoom
                    onClose={() => {
                        setIsCreateRoomOpen(false);
                        void getRoom();
                    }}
                />
            )}

            {isJoinRoomOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setIsJoinRoomOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="join-room-title"
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="join-room-title" className="text-xl font-semibold text-slate-900">
                                    Join a room
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Enter the room code shared by its creator.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsJoinRoomOpen(false)}
                                aria-label="Close join room dialog"
                                className="rounded-md px-2 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleJoinRoom} className="mt-5 space-y-4">
                            <label htmlFor="room-code" className="block text-sm font-medium text-slate-700">
                                Room code
                            </label>
                            <input
                                id="room-code"
                                value={roomCode}
                                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                                required
                                minLength={6}
                                maxLength={12}
                                autoComplete="off"
                                placeholder="Enter room code"
                                className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                            />
                            <button
                                type="submit"
                                disabled={isJoining}
                                className="w-full rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
                            >
                                {isJoining ? "Joining..." : "Join room"}
                            </button>
                        </form>
                    </section>
                </div>
            )}

            <Toaster />
        </main>
    )
}

export default Home