import { useEffect, useState, type FormEvent } from "react";
import useRoomStore from "../store/RoomStore";
import useCourseStore from "../store/CourseStore";
import { Toaster } from "react-hot-toast";

type CreateRoomProps = {
    onClose: () => void;
};

function CreateRoom({ onClose }: CreateRoomProps) {
    const { createRoom } = useRoomStore();
    const { courses, getAllCourse } = useCourseStore();

    const [codeS, setCode] = useState("");
    const [roomDetails, setRoomDetails] = useState({
        courseId: "",
        name: "",
        description: "",
        maxParticipants: 2,
        settings: {
            allowChat: false,
            allowLateJoin: false,
            showLeaderboard: false,
        },
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const code = await createRoom(roomDetails);
        if (code) {
            setCode(String(code));
            onClose();
        }
    };

    useEffect(() => {
        void getAllCourse();
    }, [getAllCourse]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-room-title"
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-slate-50 p-5 shadow-xl sm:p-8"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close create room dialog"
                    className="absolute right-4 top-4 rounded-md px-2 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                >
                    &times;
                </button>
                <div className="mb-8 pr-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        <span id="create-room-title">
                            Create Room
                        </span>
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Create a collaborative room for your students.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    {/* Course ID */}
                    <div>
                        <label
                            htmlFor="courseId"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Course ID
                        </label>
                        <select
                            id="courseId"
                            value={roomDetails.courseId}
                            onChange={(e) =>
                                setRoomDetails({
                                    ...roomDetails,
                                    courseId: e.target.value,
                                })
                            }
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                        >
                            <option value="">Select Course</option>
                            {courses && courses.map((course) => (
                                <option key={course._id} value={course._id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Room Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Room Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={roomDetails.name}
                            onChange={(e) =>
                                setRoomDetails({
                                    ...roomDetails,
                                    name: e.target.value,
                                })
                            }
                            placeholder="e.g. DAA Practice Room"
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            rows={4}
                            value={roomDetails.description}
                            onChange={(e) =>
                                setRoomDetails({
                                    ...roomDetails,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Describe what this room is for..."
                            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                        />
                    </div>

                    {/* Max Participants */}
                    <div>
                        <label
                            htmlFor="maxParticipants"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Maximum Participants
                        </label>

                        <input
                            id="maxParticipants"
                            type="number"
                            min={1}
                            value={roomDetails.maxParticipants}
                            onChange={(e) =>
                                setRoomDetails({
                                    ...roomDetails,
                                    maxParticipants: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                        />
                    </div>

                    {/* Room Settings */}
                    <div className="border-t border-slate-200 pt-6">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">
                            Room Settings
                        </h2>

                        <div className="space-y-4">
                            {/* Allow Chat */}
                            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Allow Chat
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Students can send messages in the room.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={roomDetails.settings.allowChat}
                                    onChange={(e) =>
                                        setRoomDetails({
                                            ...roomDetails,
                                            settings: {
                                                ...roomDetails.settings,
                                                allowChat: e.target.checked,
                                            },
                                        })
                                    }
                                    className="h-5 w-5 accent-[#315d4a]"
                                />
                            </label>

                            {/* Allow Late Join */}
                            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Allow Late Join
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Students can join after an exam has
                                        started.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={roomDetails.settings.allowLateJoin}
                                    onChange={(e) =>
                                        setRoomDetails({
                                            ...roomDetails,
                                            settings: {
                                                ...roomDetails.settings,
                                                allowLateJoin:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                    className="h-5 w-5 accent-[#315d4a]"
                                />
                            </label>

                            {/* Show Leaderboard */}
                            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Show Leaderboard
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Students can see the room leaderboard
                                        after an exam.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={
                                        roomDetails.settings.showLeaderboard
                                    }
                                    onChange={(e) =>
                                        setRoomDetails({
                                            ...roomDetails,
                                            settings: {
                                                ...roomDetails.settings,
                                                showLeaderboard:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                    className="h-5 w-5 accent-[#315d4a]"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-[#315d4a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244b3b] focus:outline-none focus:ring-2 focus:ring-[#47735f] focus:ring-offset-2"
                    >
                        Create Room
                    </button>

                    {codeS != "" && (
                        <div>
                            <p>Code: {codeS}</p>
                        </div>
                    )}
                </form>
            </div>
            <Toaster />
        </div>
    );
}

export default CreateRoom;