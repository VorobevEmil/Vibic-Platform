import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Application {
    id: string;
    clientId: string;
    clientSecret: string;
    displayName: string;
}

const ApplicationsList = () => {
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchApplications = async () => {
            const res = await fetch('/api/settings/applications');
            const data = await res.json();
            setApplications(data);
        };
        fetchApplications();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">OAuth Applications</h1>
                <Link to="/settings/applications/new" className="bg-green-500 text-white px-4 py-2 rounded shadow">Create New</Link>
            </div>
            <ul className="space-y-2">
                {applications.map(app => (
                    <li key={app.id} className="border p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">{app.displayName}</h2>
                        <p className="text-sm text-gray-600">Client ID: {app.clientId}</p>
                        <Link to={`/settings/applications/${app.id}`} className="text-blue-500 hover:underline mt-2 block">View / Edit</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ApplicationsList;