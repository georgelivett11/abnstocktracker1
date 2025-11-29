import { createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { InventoryApp } from "@/components/InventoryApp";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<AuthProvider>
			<InventoryApp />
		</AuthProvider>
	);
}
