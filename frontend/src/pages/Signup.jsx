import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/authSlice";


// ================= ZOD SCHEMA =================

const schema = z.object({
    firstName: z
        .string()
        .min(3, "First name must be at least 3 characters"),

    email: z
        .string()
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});


// ================= SIGNUP =================

function Signup() {

    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector(
        (state) => state.auth
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });


    // ================= SUBMIT =================

    const onSubmit = async (data) => {

        const result = await dispatch(
            registerUser(data)
        );

        if (registerUser.fulfilled.match(result)) {
            navigate("/");
        }
    };


    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">

            <div className="card w-full max-w-md bg-base-100 shadow-2xl">

                <div className="card-body">

                    {/* Heading */}

                    <div className="text-center mb-4">

                        <h1 className="text-3xl font-bold">
                            Create Account
                        </h1>

                        <p className="text-base-content/60 mt-2">
                            Sign up to get started
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >

                        {/* Backend Error */}

                        {error && (
                            <div className="alert alert-error">
                                <span>{error}</span>
                            </div>
                        )}


                        {/* First Name */}

                        <div className="form-control">

                            <label className="label">
                                <span className="label-text font-medium">
                                    First Name
                                </span>
                            </label>


                            <input
                                type="text"
                                placeholder="Enter your first name"
                                className={`input input-bordered w-full ${
                                    errors.firstName
                                        ? "input-error"
                                        : ""
                                }`}
                                {...register("firstName")}
                            />


                            {errors.firstName && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.firstName.message}
                                    </span>
                                </label>
                            )}

                        </div>


                        {/* Email */}

                        <div className="form-control">

                            <label className="label">
                                <span className="label-text font-medium">
                                    Email
                                </span>
                            </label>


                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={`input input-bordered w-full ${
                                    errors.email
                                        ? "input-error"
                                        : ""
                                }`}
                                {...register("email")}
                            />


                            {errors.email && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.email.message}
                                    </span>
                                </label>
                            )}

                        </div>


                        {/* Password */}

                        <div className="form-control">

                            <label className="label">
                                <span className="label-text font-medium">
                                    Password
                                </span>
                            </label>


                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    className={`input input-bordered w-full pr-20 ${
                                        errors.password
                                            ? "input-error"
                                            : ""
                                    }`}
                                    {...register("password")}
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>


                            {errors.password && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.password.message}
                                    </span>
                                </label>
                            )}

                        </div>


                        {/* Create Account Button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full mt-4"
                        >

                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}

                        </button>

                    </form>


                    {/* ================= LOGIN ROUTING ================= */}

                    <div className="text-center mt-6">

                        <p className="text-sm text-base-content/60">
                            Already have an account?
                        </p>

                        <Link
                            to="/login"
                            className="btn btn-link btn-sm"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Signup;