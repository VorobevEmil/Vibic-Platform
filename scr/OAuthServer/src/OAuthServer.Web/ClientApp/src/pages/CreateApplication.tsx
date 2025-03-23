import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateApplication = () => {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');

    const handleSubmit = async () => {
        const response = await fetch('/api/settings/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName,
                redirectUris: [],
                postLogoutRedirectUris: [],
                permissions: []
            })
        });

        if (response.ok) {
            navigate('/settings/applications');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create Application</h1>
            <div className="mb-4">
                <label className="block mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
        </div>
    );
};

export default CreateApplication;