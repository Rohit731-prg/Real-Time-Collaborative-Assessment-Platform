import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type ExamRoomState = {
  examPdf?: File;
  roomCode?: string;
};

function ExamRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examPdf, roomCode } = (location.state as ExamRoomState | null) ?? {};
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (!examPdf) return;
    const url = URL.createObjectURL(examPdf);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [examPdf]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <button type="button" onClick={() => navigate(roomCode ? `/roomChat/${roomCode}` : "/home")} className="mb-1 text-sm font-medium text-emerald-800 hover:text-emerald-950">
              &larr; Back to study room
            </button>
            <h1 className="truncate text-xl font-semibold">Exam room</h1>
            <p className="mt-0.5 truncate text-sm text-slate-500">{examPdf?.name ?? "No exam PDF selected"}</p>
          </div>
          {roomCode && <span className="shrink-0 font-mono text-sm text-slate-600">{roomCode}</span>}
        </div>
      </header>
      {pdfUrl ? (
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-6">
          <iframe title={`Exam PDF: ${examPdf?.name ?? "document"}`} src={pdfUrl} className="min-h-[70vh] flex-1 rounded-md border border-slate-300 bg-white" />
        </section>
      ) : (
        <section className="mx-auto grid w-full max-w-6xl flex-1 place-items-center px-4 py-12 text-center sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">No exam document available</h2>
            <p className="mt-2 text-sm text-slate-600">Return to the study room and choose a PDF to begin.</p>
            <button type="button" onClick={() => navigate(roomCode ? `/roomChat/${roomCode}` : "/home")} className="mt-5 rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900">Return to room</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default ExamRoom