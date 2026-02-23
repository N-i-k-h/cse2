import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
    onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
    const { user } = useAuth();

    // Get user initials safely
    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U'; // Fallback
    };

    const displayName = user?.name || user?.email || 'User';

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm sticky top-0 z-10 w-full">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={24} className="text-gray-600" />
            </button>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
                Dashboard
            </h2>

            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[150px] md:max-w-none">
                        {displayName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                        {user?.role || 'User'} • {user?.department || 'N/A'} Dept
                    </p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-white font-bold shadow-md shadow-green-200 flex-shrink-0">
                    {getUserInitial()}
                </div>
            </div>
        </header>
    );
};
