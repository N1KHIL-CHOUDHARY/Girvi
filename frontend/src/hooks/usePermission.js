import { useAuth } from '../contexts/AuthContext';

export function usePermission() {
	const { user } = useAuth();

	const hasPermission = (permissionKey) => {
		// Owner shortcut
		if (user?.role === 'owner') return true;
		// Workers must have explicit permissions
		return Boolean(user?.permissions?.[permissionKey]);
	};

	return { hasPermission, user };
}


