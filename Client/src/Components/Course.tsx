import { MdClose, MdDelete, MdEdit, MdSave } from "react-icons/md";
import useCourseStore from "../store/CourseStore";
import { useEffect, useState, type FormEvent } from "react";
import { Toaster } from "react-hot-toast";

type CourseDraft = {
    name: string;
    code: string;
    description: string;
};

function Course() {
    const {
        courses,
        createCourse,
        getAllCourse,
        updateCourse,
        deleteCourse,
    } = useCourseStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<CourseDraft | null>(null);
    const [busyCourseId, setBusyCourseId] = useState<string | null>(null);

    const startEditing = (course: CourseDraft & { _id: string }) => {
        setEditingCourseId(course._id);
        setEditDraft({
            name: course.name,
            code: course.code,
            description: course.description || "",
        });
    };

    const stopEditing = () => {
        setEditingCourseId(null);
        setEditDraft(null);
    };

    const saveCourse = async (id: string) => {
        if (!editDraft) return;
        setBusyCourseId(id);
        const updated = await updateCourse(id, editDraft);
        setBusyCourseId(null);
        if (updated) stopEditing();
    };

    const removeCourse = async (id: string, name: string) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setBusyCourseId(id);
        await deleteCourse(id);
        setBusyCourseId(null);
    };

    const changeDraft = (field: keyof CourseDraft, value: string) => {
        setEditDraft((draft) => draft ? { ...draft, [field]: value } : draft);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            name: String(formData.get("name")).trim(),
            code: String(formData.get("code")).trim(),
            description: String(formData.get("description")).trim(),
        };

        setIsSubmitting(true);
        const created = await createCourse(data);
        setIsSubmitting(false);
        if (created) form.reset();
    };

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            await getAllCourse();
            setIsLoading(false);
        }

        void fetchData();
    }, [getAllCourse]);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
                        Learning workspace
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-950">
                        Courses
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Create a course or review the courses in your department.
                    </p>
                </header>

                <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Create course
                        </h2>
                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <div>
                                <label
                                    htmlFor="course-name"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Course name
                                </label>
                                <input
                                    id="course-name"
                                    name="name"
                                    type="text"
                                    required
                                    maxLength={100}
                                    placeholder="e.g. Data Structures"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="course-code"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Course code
                                </label>
                                <input
                                    id="course-code"
                                    name="code"
                                    type="text"
                                    required
                                    maxLength={20}
                                    placeholder="e.g. CS201"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="course-description"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Description <span className="font-normal text-slate-500">(optional)</span>
                                </label>
                                <textarea
                                    id="course-description"
                                    name="description"
                                    rows={4}
                                    maxLength={500}
                                    placeholder="What will students learn?"
                                    className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                            >
                                {isSubmitting ? "Creating..." : "Create course"}
                            </button>
                        </form>
                    </aside>

                    <section className="min-w-0" aria-labelledby="course-list-heading">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <h2
                                    id="course-list-heading"
                                    className="text-lg font-semibold text-slate-900"
                                >
                                    Your courses
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    {courses.length} {courses.length === 1 ? "course" : "courses"}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            {isLoading ? (
                                <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">
                                    Loading courses...
                                </p>
                            ) : courses.length === 0 ? (
                                <p className="px-5 py-12 text-center text-sm text-slate-500">
                                    No courses yet. Create one to get started.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] border-collapse text-left">
                                        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                                            <tr>
                                                <th scope="col" className="px-5 py-3 font-semibold">Course</th>
                                                <th scope="col" className="px-5 py-3 font-semibold">Code</th>
                                                <th scope="col" className="px-5 py-3 font-semibold">University</th>
                                                <th scope="col" className="px-5 py-3 font-semibold">Semester</th>
                                                <th scope="col" className="px-5 py-3 font-semibold">Description</th>
                                                <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {courses.map((course) => {
                                                const isEditing = editingCourseId === course._id && editDraft !== null;
                                                const isBusy = busyCourseId === course._id;

                                                return (
                                                    <tr key={course._id} className="align-top">
                                                        <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                            {isEditing ? (
                                                                <input
                                                                    aria-label="Course name"
                                                                    value={editDraft.name}
                                                                    maxLength={100}
                                                                    onChange={(event) => changeDraft("name", event.currentTarget.value)}
                                                                    className="w-full min-w-32 rounded border border-slate-300 px-2 py-1 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                                                />
                                                            ) : course.name}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm font-semibold text-emerald-900">
                                                            {isEditing ? (
                                                                <input
                                                                    aria-label="Course code"
                                                                    value={editDraft.code}
                                                                    maxLength={20}
                                                                    onChange={(event) => changeDraft("code", event.currentTarget.value)}
                                                                    className="w-24 rounded border border-slate-300 px-2 py-1 uppercase outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                                                />
                                                            ) : course.code}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-700">
                                                            {course.university}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-700">
                                                            {course.semester}
                                                        </td>
                                                        <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                                                            {isEditing ? (
                                                                <input
                                                                    aria-label="Course description"
                                                                    value={editDraft.description}
                                                                    maxLength={500}
                                                                    onChange={(event) => changeDraft("description", event.currentTarget.value)}
                                                                    className="w-full min-w-40 rounded border border-slate-300 px-2 py-1 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                                                />
                                                            ) : course.description || "No description"}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-1">
                                                                {isEditing ? (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            title="Save changes"
                                                                            aria-label={`Save changes to ${course.name}`}
                                                                            disabled={isBusy || !editDraft.name.trim() || !editDraft.code.trim()}
                                                                            onClick={() => void saveCourse(course._id)}
                                                                            className="rounded p-2 text-emerald-800 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-50"
                                                                        >
                                                                            <MdSave size={19} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            title="Cancel editing"
                                                                            aria-label={`Cancel editing ${course.name}`}
                                                                            disabled={isBusy}
                                                                            onClick={stopEditing}
                                                                            className="rounded p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                                                        >
                                                                            <MdClose size={19} />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            title="Edit course"
                                                                            aria-label={`Edit ${course.name}`}
                                                                            disabled={busyCourseId !== null || editingCourseId !== null}
                                                                            onClick={() => startEditing(course)}
                                                                            className="rounded p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                                                        >
                                                                            <MdEdit size={19} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            title="Delete course"
                                                                            aria-label={`Delete ${course.name}`}
                                                                            disabled={isBusy || editingCourseId !== null}
                                                                            onClick={() => void removeCourse(course._id, course.name)}
                                                                            className="rounded p-2 text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50"
                                                                        >
                                                                            <MdDelete size={19} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <Toaster/>
        </main>
    );
}

export default Course