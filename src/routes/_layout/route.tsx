import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayHeader } from "./-component/lay-header";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-20 flex flex-col gap-20">
			<LayHeader />
			<Outlet />
		</div>
	);
}
