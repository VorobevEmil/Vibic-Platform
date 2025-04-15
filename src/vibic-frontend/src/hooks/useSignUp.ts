import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSignUp() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('https://localhost:7154/auth/sign-up', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert('Registration failed: ' + error.message);
                return;
            }

            alert('Account created! 🎉');
            navigate('/sign-in'); 
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    return {
        username, setUsername,
        email, setEmail,
        password, setPassword,
        handleRegister
    };
}