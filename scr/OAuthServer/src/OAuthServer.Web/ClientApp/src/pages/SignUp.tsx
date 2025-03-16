import { useForm } from "react-hook-form";
import { signUp } from "../api/authApi";
import { useState } from "react";

interface SignUpForm {
    username: string;
    email: string;
    password: string;
}

const SignUp = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>();
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = async (data: SignUpForm) => {
        try {
            const response = await signUp(data.username, data.email, data.password);
            console.log("Регистрация успешна:", response);
        } catch (error) {
            setErrorMessage("Ошибка регистрации. Попробуйте другой email.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Регистрация</h2>
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block">Имя пользователя</label>
                        <input {...register("username", { required: "Имя обязательно" })} type="text"
                               className="w-full p-2 border border-gray-300 rounded mt-1" />
                        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
                    </div>
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
                    <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Зарегистрироваться</button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
