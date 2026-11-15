import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProblem from "./pages/CreateProblem";
import EditProblem from "./pages/EditProblem";
import ProblemDetail from "./pages/ProblemDetail"; 
import Profile from './pages/Profile';

import { checkAuth } from "./redux/authSlice";


// =====================================================
// APP
// =====================================================

function App() {

    const dispatch = useDispatch();

    const {
        isAuthenticated,
        loading,
    } = useSelector((state) => state.auth);


    // =================================================
    // CHECK AUTH ON APP START
    // =================================================

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }


    return (
        <BrowserRouter>
            <Routes>
                {/* ================= LOGIN ================= */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to="/" replace />
                            : <Login />
                    }
                />

                {/* ================= SIGNUP ================= */}
                <Route
                    path="/signup"
                    element={
                        isAuthenticated
                            ? <Navigate to="/" replace />
                            : <Signup />
                    }
                />

                {/* ================= HOME ================= */}
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <Homepage />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* ================= ADMIN DASHBOARD ================= */}
                <Route
                    path="/admin/dashboard"
                    element={
                        isAuthenticated
                            ? <AdminDashboard />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* ================= CREATE PROBLEM ================= */}
                <Route
                    path="/admin/create-problem"
                    element={
                        isAuthenticated
                            ? <CreateProblem />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* ================= EDIT PROBLEM ================= */}
                <Route
                    path="/admin/edit-problem/:id"
                    element={
                        isAuthenticated
                            ? <EditProblem />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* ================= PROBLEM DETAIL ================= */}
                <Route
                    path="/problem/:id"
                    element={
                        isAuthenticated
                            ? <ProblemDetail />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* ================= UNKNOWN ROUTE ================= */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                isAuthenticated
                                    ? "/"
                                    : "/login"
                            }
                            replace
                        />
                    }
                />

                <Route
  path="/profile"
  element={
    isAuthenticated
      ? <Profile />
      : <Navigate to="/login" replace />
  }
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;