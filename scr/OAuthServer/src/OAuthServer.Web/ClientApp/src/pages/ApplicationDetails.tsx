import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ApplicationDto {
    id: string;
    clientId: string;
    clientSecret: string;
    displayName: string;
}

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState<ApplicationDto | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            const res = await fetch(`/api/settings/applications/${id}`);
            const data = await res.json();
            setApp(data);
            setDisplayName(data.displayName);
        };
        fetchApp();
    }, [id]);

    const handleUpdate = async () => {
        await fetch(`/api/settings/applications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...app, displayName })
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
    };

    if (!app) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Application</h1>
            <div className="mb-4">
                <label className="block mb-1">Client ID</label>
                <input type="text" value={app.clientId} readOnly className="w-full p-2 border rounded bg-gray-100" />
            </div>
            <div className="mb-4">
                <label className="block mb-1">Client Secret</label>
                <input type="text" value={app.clientSecret} readOnly className="w-full p-2 border rounded bg-gray-100" />
            </div>
            <div className="mb-4">
                <label className="block mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                <button
                    onClick={async () => {
                        await fetch(`/api/settings/applications/${id}`, { method: 'DELETE' });
                        navigate('/settings/applications');
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Delete
                </button>
            </div>
            {success && <p className="text-green-500 mt-2">Updated successfully</p>}
        </div>
    );
};

export default ApplicationDetails;