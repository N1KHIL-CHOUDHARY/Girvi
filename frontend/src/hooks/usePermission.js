export function usePermission() {
	const hasPermission = (permissionKey) => {
		// No auth - always return true
		return true;
	};

	return { hasPermission };
}


