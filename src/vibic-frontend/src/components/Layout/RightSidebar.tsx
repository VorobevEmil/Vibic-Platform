import { useRightSidebarContext } from '../../context/RightSidebarContext';

export default function RightSidebar() {
    const { sidebar, isVisible } = useRightSidebarContext();

    if (!sidebar || !isVisible) {
        return null;
    }

    return <>{sidebar}</>;
}
