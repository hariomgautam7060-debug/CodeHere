import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axios";

// =====================================================
// REGISTER USER
// =====================================================

export const registerUser = createAsyncThunk(
    "auth/registerUser",

    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                "/register",
                userData
            );

            return response.data.user;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    }
);


// =====================================================
// LOGIN USER
// =====================================================

export const loginUser = createAsyncThunk(
    "auth/loginUser",

    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                "/login",
                userData
            );

            return response.data.user;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Login failed"
            );
        }
    }
);


// =====================================================
// CHECK AUTHENTICATION
// =====================================================

export const checkAuth = createAsyncThunk(
    "auth/checkAuth",

    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                "/check"
            );

            return response.data.user;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "User is not authenticated"
            );
        }
    }
);


// =====================================================
// LOGOUT USER
// =====================================================

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",

    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                "/logout"
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Logout failed"
            );
        }
    }
);


// =====================================================
// ADMIN REGISTER
// =====================================================

export const adminRegister = createAsyncThunk(
    "auth/adminRegister",

    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                "/admin/register",
                userData
            );

            return response.data.user;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Admin registration failed"
            );
        }
    }
);


// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
    user: null,
    loading: false,
    isAuthenticated: false,
    error: null,
};


// =====================================================
// AUTH SLICE
// =====================================================

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {

        // =================================================
        // REGISTER
        // =================================================

        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })

            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            });


        // =================================================
        // LOGIN
        // =================================================

        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            });


        // =================================================
        // CHECK AUTH
        // =================================================

        builder
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })

            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            });


        // =================================================
        // LOGOUT
        // =================================================

        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })

            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // =================================================
        // ADMIN REGISTER
        // =================================================

        builder
            .addCase(adminRegister.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(adminRegister.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })

            .addCase(adminRegister.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;