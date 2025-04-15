import { useEffect, useState } from 'react';

type Server = { id: string; name: string };
type Friend = { id: string; username: string };
type DirectChat = { id: string; user: { username: string } };

function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);

  useEffect(() => {
    // В реальности — replace fetch'и своими API вызовами

    fetch('http://localhost:5000/api/servers/mine', { credentials: 'include' })
      .then(res => res.json())
      .then(setServers);

    fetch('http://localhost:5000/api/friends', { credentials: 'include' })
      .then(res => res.json())
      .then(setFriends);

    fetch('http://localhost:5000/api/dm', { credentials: 'include' })
      .then(res => res.json())
      .then(setDirectChats);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold">Welcome to Vibic 👋</h1>

      {/* Servers */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Servers</h2>
        <ul className="space-y-2">
          {servers.map(server => (
            <li key={server.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              {server.name}
            </li>
          ))}
          {servers.length === 0 && <p className="text-gray-500">No servers yet.</p>}
        </ul>
      </section>

      {/* Friends */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        <ul className="space-y-2">
          {friends.map(friend => (
            <li key={friend.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              {friend.username}
            </li>
          ))}
          {friends.length === 0 && <p className="text-gray-500">No friends yet.</p>}
        </ul>
      </section>

      {/* Direct Chats */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Direct Messages</h2>
        <ul className="space-y-2">
          {directChats.map(chat => (
            <li key={chat.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              Chat with <strong>{chat.user.username}</strong>
            </li>
          ))}
          {directChats.length === 0 && <p className="text-gray-500">No direct chats.</p>}
        </ul>
      </section>
    </div>
  );
}

export default DashboardPage;
