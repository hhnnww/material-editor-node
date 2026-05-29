import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/material-edit")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
