import React from "react";
import RegisterForm from "../components/Auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create an Account 
        </h2>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
