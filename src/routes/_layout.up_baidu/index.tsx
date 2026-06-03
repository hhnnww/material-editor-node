import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/up_baidu/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_layout/up_baidu/"!</div>;
}
