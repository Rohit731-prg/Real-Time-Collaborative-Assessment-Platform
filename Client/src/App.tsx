import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import MainAuth from "./Components/Auth/MainAuth";
import Course from "./Components/Course";
import RoomChat from "./Components/RoomChat";
import ExamRoom from "./Components/ExamRoom";
import ResetPassword from "./Components/Auth/ResetPassword";
import PreAiChatRoom from "./Components/PreAiChatRoom";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainAuth />} />
        <Route path="/login" element={<MainAuth />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/course" element={<Course />} />
          <Route path="/roomChat/:roomCode" element={<RoomChat />} />
          <Route path="/examRoom/:roomCode" element={<ExamRoom />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/preAiChatRoom/:roomCode" element={<PreAiChatRoom />} />
          <Route path="/preAiChatRoom" element={<PreAiChatRoom />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App