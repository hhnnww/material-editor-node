import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/auto_action")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
