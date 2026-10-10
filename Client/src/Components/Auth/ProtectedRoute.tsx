import useStudentStore from "../../store/StudentStore";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const { currentUser } = useStudentStore()
    console.log("currentUser: ", currentUser);

    if (!currentUser) {
        return <Navigate to={"/login"} replace />
    }

    return (
        <Outlet />
    )
}

export default ProtectedRoute;