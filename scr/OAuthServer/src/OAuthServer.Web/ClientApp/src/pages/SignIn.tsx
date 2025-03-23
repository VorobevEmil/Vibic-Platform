import { useForm } from "react-hook-form";
import { signIn } from "../api/authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignInForm {
    email: string;
    password: string;
}

const SignIn = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>();
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const onSubmit = async (data: SignInForm) => {
        try {
            const response = await signIn(data.email, data.password);
            console.log("Успешный вход:", response);
            navigate("/");
        } catch (error) {
            setErrorMessage("Ошибка входа. Проверьте email и пароль.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Вход</h2>
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block">Email</label>
                        <input {...register("email", { required: "Email обязателен" })} type="email"
                               className="w-full p-2 border border-gray-300 rounded mt-1" />
                        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block">Пароль</label>
                        <input {...register("password", { required: "Пароль обязателен" })} type="password"
                               className="w-full p-2 border border-gray-300 rounded mt-1" />
                        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
