import { ORPC_删除文件 } from "./orpc-删除文件";
import { ORPC_制作数据图 } from "./orpc-制作数据图";
import { ORPC_制作详情 } from "./orpc-制作详情";
import { ORPC_制作首图 } from "./orpc-制作首图";
import { ORPC_加载素材 } from "./orpc-加载素材";
import { ORPC_文件夹操作 } from "./orpc-文件夹操作";
import { orpcMaterialAutoMake } from "./orpc-文件夹自动处理/orpc-下载目录移动到素材目录";
import { orpc_获取所有目录列表 } from "./orpc-文件夹自动处理/orpc-获取所有目录列表";
import { orpcMaterialScrpy } from "./orpc-素材下载";

export default {
	ORPC_加载素材,
	ORPC_文件夹操作,
	ORPC_制作首图,
	ORPC_制作详情,
	ORPC_制作数据图,
	ORPC_删除文件,
	orpcMaterialScrpy,
	orpcMaterialAutoMake,
	orpc_获取所有目录列表,
};
