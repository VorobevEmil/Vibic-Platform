import { useEffect, useState } from "react";
import { api } from "../utils/axiosInstance";

export const ApplicationsListPage = () => {
    const [apps, setApps] = useState<any[]>([]);

    useEffect(() => {
        api.get('/api/settings/applications')
            .then(r => setApps(r.data))
            .catch(console.error);
    }, []);

    return (
        <div>
            <h1>Applications</h1>
            <ul>
                {apps.map((app, i) => <li key={i}>{JSON.stringify(app)}</li>)}
            </ul>
        </div>
    );
};
