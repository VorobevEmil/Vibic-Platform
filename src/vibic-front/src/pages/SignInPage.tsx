import { useState } from "react";
import { signIn } from "../api/authApi";

export const SignInPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = async () => {
        await signIn({ email, password });
        alert("Signed in");
    };

    return (
        <div>
            <h1>Sign In</h1>
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleSignIn}>Sign In</button>
        </div>
    );
};
