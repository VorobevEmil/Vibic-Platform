import UserProfileType from '../../types/UserProfileType';

interface Props {
    user: UserProfileType;
    onClick: () => void;
}

export default function SearchResultItem({ user, onClick }: Props) {
    return (
        <div
            className="flex items-center gap-3 px-3 py-2 bg-[#3c3e45] rounded hover:bg-[#4b4e58] cursor-pointer transition"
            onClick={onClick}
        >
            <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
            <span className="text-sm">{user.username}</span>
        </div>
    );
}
