import { Link, linkOptions } from "@tanstack/react-router";
import { CloudUpload, Home, ImagePlay, Workflow } from "lucide-react";
import { Button } from "#/components/ui/button";

export function LayHeader() {
	const headerMenus = [
		{ name: "首页", link: linkOptions({ to: "/" }), icon: <Home /> },
		{
			name: "素材编辑",
			link: linkOptions({ to: "/maf" }),
			icon: <ImagePlay />,
		},
		{
			name: "批处理",
			link: linkOptions({ to: "/auto_action" }),
			icon: <Workflow />,
		},
		{
			name: "上传到百度网盘",
			link: linkOptions({ to: "/up_baidu" }),
			icon: <CloudUpload />,
		},
	];
	return (
		<div className="flex flex-row ">
			{headerMenus.map((item) => {
				return (
					<Link key={item.name} {...item.link} className="group">
						<Button className="group-[.active]:bg-blue-700 group-[.active]:text-white">
							{item.icon}
							{item.name}
						</Button>
					</Link>
				);
			})}
		</div>
	);
}
