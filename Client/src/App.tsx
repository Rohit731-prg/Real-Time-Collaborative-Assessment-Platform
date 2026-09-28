import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import MainAuth from "./Components/Auth/MainAuth";
import Course from "./Components/Course";
import RoomChat from "./Components/RoomChat";
import ExamRoom from "./Components/ExamRoom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainAuth />} />
        <Route path="/login" element={<MainAuth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route path="/roomChat/:roomCode" element={<RoomChat />} />
        <Route path="/examRoom/:roomCode" element={<ExamRoom />} />
      </Routes>
    </Router>
  )
}

export default App