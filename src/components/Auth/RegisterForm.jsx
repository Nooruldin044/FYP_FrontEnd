import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password", "");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Attempt to register user via AuthContext
      await registerUser(data.username, data.email, data.password);
      navigate("/"); // Redirect on success
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create your account
      </h2>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            autoComplete="username"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
            }`}
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "At least 3 characters" },
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers, and underscores allowed" },
            })}
          />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            autoComplete="email"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: "Invalid email address" },
            })}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:outline-none ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Must include uppercase, lowercase, number & special char",
                },
              })}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              At least 8 characters, one uppercase, one lowercase, one number, one special char.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:outline-none ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        {/* Agree to Terms */}
        <div className="flex items-start">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            {...register("agreeToTerms", { required: "You must agree before continuing" })}
          />
          <label className="ml-2 text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms of Service</a> and{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>
          </label>
        </div>
        {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Already have account */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
