import { useState } from "react";
import { signUp } from "../api/authApi";

export const SignUpPage = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async () => {
        await signUp({ email, username, password });
        alert("Registered");
    };

    return (
        <div>
            <h1>Sign Up</h1>
            <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleSignUp}>Sign Up</button>
        </div>
    );
};
