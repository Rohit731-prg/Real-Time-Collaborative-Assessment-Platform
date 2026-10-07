import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import { Toaster } from "react-hot-toast";
import useRoomStore from "../store/RoomStore";
import useStudentStore from "../store/StudentStore";

const Home = () => {
    const navigate = useNavigate();
    const { rooms, joinedRooms, getRoom, getAllJoinedRoom, joinRoom } = useRoomStore();
    const logout = useStudentStore((state) => state.logout);

    const [activeTab, setActiveTab] = useState<"all" | "created" | "joined">("all");
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        void Promise.all([getRoom(), getAllJoinedRoom()]).finally(() => setIsLoading(false));
    }, [getRoom, getAllJoinedRoom]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

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

    // Combine rooms with origin indicator
    const createdList = (rooms || []).map((room) => ({ ...room, origin: "created" as const }));
    const joinedList = (joinedRooms || []).map((room) => ({ ...room, origin: "joined" as const }));

    const displayedRooms =
        activeTab === "created"
            ? createdList
            : activeTab === "joined"
            ? joinedList
            : [...createdList, ...joinedList];

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
                            Manage your collaborative assessment rooms, exams, and courses.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
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
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                        >
                            Log out
                        </button>
                    </div>
                </header>

                <section aria-labelledby="rooms-heading">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 id="rooms-heading" className="text-xl font-semibold text-slate-900">
                                Assessment Rooms
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Click on any room to view exams and launch AI study chat.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setActiveTab("all")}
                                className={`rounded-md px-3 py-1.5 transition ${
                                    activeTab === "all"
                                        ? "bg-emerald-800 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                All ({createdList.length + joinedList.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("created")}
                                className={`rounded-md px-3 py-1.5 transition ${
                                    activeTab === "created"
                                        ? "bg-emerald-800 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Created ({createdList.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("joined")}
                                className={`rounded-md px-3 py-1.5 transition ${
                                    activeTab === "joined"
                                        ? "bg-emerald-800 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Joined ({joinedList.length})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {isLoading ? (
                            <p className="px-5 py-14 text-center text-sm text-slate-500" role="status">
                                Loading rooms...
                            </p>
                        ) : displayedRooms.length === 0 ? (
                            <div className="px-5 py-14 text-center">
                                <p className="text-sm font-medium text-slate-800">
                                    No rooms found
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {activeTab === "created"
                                        ? "You haven't created any rooms yet. Click 'Create room' above."
                                        : activeTab === "joined"
                                        ? "You haven't joined any rooms yet. Click 'Join room' above."
                                        : "Create a room for your students or join one with a room code."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] border-collapse text-left">
                                    <thead className="bg-slate-100/75 text-xs font-semibold uppercase text-slate-600">
                                        <tr>
                                            <th scope="col" className="px-5 py-3.5">Room</th>
                                            <th scope="col" className="px-5 py-3.5">Role</th>
                                            <th scope="col" className="px-5 py-3.5">Room code</th>
                                            <th scope="col" className="px-5 py-3.5">Status</th>
                                            <th scope="col" className="px-5 py-3.5">Max participants</th>
                                            <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {displayedRooms.map((room) => (
                                            <tr
                                                key={`${room.origin}-${room._id}`}
                                                onClick={() => navigate(`/preAiChatRoom/${room.roomCode || room._id}`)}
                                                className="group cursor-pointer transition hover:bg-emerald-50/50"
                                            >
                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-900 group-hover:text-emerald-900">
                                                        {room.name}
                                                    </span>
                                                    {room.description && (
                                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                            {room.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            room.origin === "created"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-sky-100 text-sky-800"
                                                        }`}
                                                    >
                                                        {room.origin === "created" ? "Creator" : "Joined"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-mono text-sm font-medium text-slate-700">
                                                    {room.roomCode}
                                                </td>
                                                <td className="px-5 py-4 text-sm capitalize text-slate-700">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className={`h-2 w-2 rounded-full ${
                                                                room.status === "active"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-400"
                                                            }`}
                                                        />
                                                        {room.status || "active"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-700">
                                                    {room.maxParticipants}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 transition group-hover:translate-x-0.5 group-hover:underline">
                                                        View Exams & Chat →
                                                    </span>
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
    );
};

export default Home;