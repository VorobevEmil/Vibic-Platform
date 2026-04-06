import { useRightSidebarContext } from '../../context/RightSidebarContext';

export default function RightSidebar() {
    const { sidebar } = useRightSidebarContext();

    if (!sidebar) {
        return null;
    }

    return <>{sidebar}</>;
}
