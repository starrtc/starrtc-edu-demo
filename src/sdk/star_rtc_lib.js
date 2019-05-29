var StarRtc = window.NameSpace || {};
///////////////////////////////////////顶层协议//////////////////////////////////////////////
//APP产品编号	长度		APP版本	Reserved1	Reserved2	命令组	 正文	结束符
//0xFF	        0xFFFFFFFF	0xFF	0xFFFF	    0xFFFF	    0xFF	 ...	0x1234
//长度表示数据包的长度，包括len本身的4个byte直到结束符的长度

//APP产品编号
if (typeof APP_PRODUCT_ID == "undefined") {
	var i = 0;
	var APP_PRODUCT_ID = {
		APP_PRODUCT_MSGSERVER: i++,               //msgServer发出
		APP_PRODUCT_CHATROOMMOONSERVER: i++,	//chatRoomMoonServer发出
		APP_PRODUCT_AMOONSERVER: i++,		        //AMoonServer发出
		APP_PRODUCT_ASYNDMS: i++,			        //AsynDMS发出
		APP_PRODUCT_APROXYSERVER: i++,		    //AProxyServer发出
		APP_PRODUCT_APROXYCONNECTOR: i++,	    //AProxyConnector发出
		APP_PRODUCT_LIVESRCMOONSERVER: i++,	    //liveSrcMoonServer发出
		APP_PRODUCT_LIVEVDNMOONSERVER: i++,	    //liveVdnMoonServer发出
		APP_PRODUCT_VOIPMOONSERVER: i++,		    //voipMoonServer发出
		APP_PRODUCT_STAR_SDK: i++, 			    //star SDK产品使用者发出
		APP_PRODUCT_TURNSERVER: i++ 		        //数据中转服务发出
	};
};

//命令组
if (typeof ACTION_GROUP_ID == "undefined") {
	var i = 0;
	var ACTION_GROUP_ID = {
		ACTIONGROUP_MSG: i++,                //msgServer
		ACTIONGROUP_CHATROOM: i++,
		ACTIONGROUP_MOON_PROXY: i++,		  //代理服务使用，如moonServer、asynDMS等
		ACTIONGROUP_LIVESTREAM: i++,
		ACTIONGROUP_VOIP: i++,
		ACTIONGROUP_TURN: i++
	};
};

//消息类型
if (typeof MSG_TYPE == "undefined") {
	var i = 0;
	var MSG_TYPE = {
		MSG_TYPE_SINGLE_CHAT: i++,
		MSG_TYPE_GROUP_CHAT: i++,
		MSG_TYPE_PRIVATE_GROUP_CHAT: i++,
		MSG_TYPE_GROUP_INFO_PUSH: i++,
		MSG_TYPE_SYSTEM_INFO_PUSH: i++
	};
};

//消息数据类型（在线消息，离线消息 等）
if (typeof MSG_DATA_TYPE == "undefined") {
	var i = 0;
	var MSG_DATA_TYPE = {
		MSG_DATA_TYPE_CONTROL: i++,//控制类内容（用户不在线时,不推送、不入库）
		MSG_DATA_TYPE_CONTROL2: i++,//控制类内容（用户不在线时,不推送、入库）
		MSG_DATA_TYPE_CONTENT: i++,//正文内容（用户不在线时，推送可控、入库）
		MSG_DATA_TYPE_CALLING: i++//voip请求消息（用户不在线时，推送可控、不入库）
	};
}

//加密类型
if (typeof ENCRYPT_TYPE == "undefined") {
	var i = 0;
	var ENCRYPT_TYPE = {
		ENCRYPT_TYPE_NONE: i++,
		ENCRYPT_TYPE_AES_128_CFB: i++
	};
};

if (typeof AG_MSG_VOIP_CTRL == "undefined") {
	var AG_MSG_VOIP_CTRL =
	{
		CONTROL_CODE_VOIP_CALL: 1000,//申请通话
		CONTROL_CODE_VOIP_CALL_AUDIO: 1100,//申请语音通话
		CONTROL_CODE_VOIP_REFUSE: 1001,//拒绝通话
		CONTROL_CODE_VOIP_HANGUP: 1002,//通话后挂断
		CONTROL_CODE_VOIP_BUSY: 1003,//占线
		CONTROL_CODE_VOIP_CONNECT: 1004//接通
	}
}

if (typeof CHATROOM_LIST_TYPE == "undefined") {
	var i = 0;
	var CHATROOM_LIST_TYPE = {
		CHATROOM_LIST_TYPE_CHATROOM: i++,
		CHATROOM_LIST_TYPE_LIVE: i++,
		CHATROOM_LIST_TYPE_LIVE_PUSH: i++,
		CHATROOM_LIST_TYPE_MEETING: i++,
		CHATROOM_LIST_TYPE_MEETING_PUSH: i++,
		CHATROOM_LIST_TYPE_CLASS: i++,
		CHATROOM_LIST_TYPE_CLASS_PUSH: i++
	};
};

//msg内容协议:
//[4 byte digestLength][digest][4 byte contentLength][content]
/////////////////////////////////////////msgServer协议正文////////////////////////////////////////////////
//命令组
if (typeof AG_MSG == "undefined") {
	var i = 0;
	var AG_MSG = {
		//所有char类型都不包含\0, len也不包括\0
		//len表示数据包的长度，包括len本身的2 byte，但不包含actionCode

		//[MSG_CLIENT_AUTH][2 byte userIdLen][userId][32 byte starToken]
		MSG_CLIENT_AUTH: i++,

		//返回msg内容最大长度
		//[MSG_CLIENT_AUTH_FIN_OK][2 byte maxContentLen]
		MSG_CLIENT_AUTH_FIN_OK: i++,

		//[MSG_CLIENT_AUTH_FIN_FAILED]
		MSG_CLIENT_AUTH_FIN_FAILED: i++,

		//client send alive to msgServer
		//[MSG_ALIVE_CLIENT]
		MSG_ALIVE_CLIENT: i++,

		//msgServer send to client
		//[MSG_FIN_ALIVE]
		MSG_FIN_ALIVE: i++,

		//A(or server) send msg
		//另一种是msgServer要送达的用户不在此服务器上，需要根据hash转发给其他msgServer，token
		//[MSG_CLIENT_SEND_MSG][2 byte from userIdLen][from userId][2 byte userIdLen][to userId][4 byte msg index][1 byte encryptType]{n byte encrypt staff}[1 byte msgDataType][4 byte msgLen][msg]
		//encryptType == ENCRYPT_TYPE_NONE			无加密			encrypt staff: null
		//encryptType == ENCRYPT_TYPE_AES_128_CFB	AES-128-CFB		encrypt staff: [2 byte AES key version][20 byte AES HMAC]
		MSG_CLIENT_SEND_MSG: i++,

		//===========转发到groupPushMoonServer===========

		//user请求创建群
		//reqIndex用于创建成功后返回给用户，表示请求流水号，用户用来区分是哪一条请求成功
		//[MSG_CLIENT_GROUP_CREATE][4 byte reqIndex][2 byte reqUserIdLen][reqUserId][4 byte addUsersLen][addUsers][4 byte userDefineDataLen][userDefineData]
		MSG_CLIENT_GROUP_CREATE: i++,

		//user请求删除群
		//[MSG_CLIENT_GROUP_DEL][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId]
		MSG_CLIENT_GROUP_DEL: i++,

		//user请求增加群成员
		//[MSG_CLIENT_GROUP_ADD_USER][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId][4 byte addUsersLen][addUsers][4 byte userDefineDataLen][userDefineData]
		MSG_CLIENT_GROUP_ADD_USER: i++,

		//user请求删除群成员
		//[MSG_CLIENT_GROUP_REMOVE_USER][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId][4 byte removeUsersLen][removeUsers]
		MSG_CLIENT_GROUP_REMOVE_USER: i++,

		//user请求开启群免打扰
		//[MSG_CLIENT_SET_GROUP_PUSH_IGNORE][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId]
		MSG_CLIENT_SET_GROUP_PUSH_IGNORE: i++,

		//user请求关闭群免打扰
		//[MSG_CLIENT_UNSET_GROUP_PUSH_IGNORE][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId]
		MSG_CLIENT_UNSET_GROUP_PUSH_IGNORE: i++,


		//user推送系统消息到指定用户
		//[MSG_CLIENT_PUSH_SYSTEM_MSG][4 byte reqIndex][2 byte reqUserIdLen][reqUserId][4 byte pushUsersLen][pushUsers][1 byte msgDataType][4 byte msgLen][msg]
		MSG_CLIENT_PUSH_SYSTEM_MSG: i++,

		//user推送群系统消息到指定群
		//[MSG_CLIENT_PUSH_SYSTEM_GROUP_MSG][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId][1 byte msgDataType][4 byte msgLen][msg]
		MSG_CLIENT_PUSH_SYSTEM_GROUP_MSG: i++,

		//user发送群消息,atUserIds是指需要@的用户列表，用逗号分隔，用于免打扰用户的@推送
		//[MSG_CLIENT_SEND_GROUPMSG][2 byte atUserIdsLen][atUserIds][4 byte groupMsgIndex][2 byte groupIdLen][groupId][2 byte fromUserIdLen][fromUserId][1 byte encryptType]{n byte encrypt staff}[1 byte msgDataType][4 byte msgLen][msg]
		MSG_CLIENT_SEND_GROUPMSG: i++,

		//========END 转发到groupPushMoonServerend END========

		//===========返回给用户的协议===========

		//[MSG_SERVER_SEND_GROUPMSG_FIN][2 byte statusLen][status][4 byte groupMsgIndex][2 byte groupIdLen][groupId][4 byte server timestamp]
		MSG_SERVER_SEND_GROUPMSG_FIN: i++,

		//[MSG_SERVER_GROUP_CREATE_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_GROUP_CREATE_FIN: i++,

		//[MSG_SERVER_GROUP_DEL_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_GROUP_DEL_FIN: i++,

		//[MSG_SERVER_GROUP_ADD_USER_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_GROUP_ADD_USER_FIN: i++,

		//[MSG_SERVER_GROUP_REMOVE_USER_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_GROUP_REMOVE_USER_FIN: i++,

		//[MSG_SERVER_SET_GROUP_PUSH_IGNORE_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_SET_GROUP_PUSH_IGNORE_FIN: i++,

		//[MSG_SERVER_UNSET_GROUP_PUSH_IGNORE_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_UNSET_GROUP_PUSH_IGNORE_FIN: i++,

		//[MSG_SERVER_PUSH_SYSTEM_MSG_FIN][2 byte statusLen][status][4 byte reqIndex]
		MSG_SERVER_PUSH_SYSTEM_MSG_FIN: i++,

		//[MSG_SERVER_PUSH_GROUP_SYSTEM_MSG_FIN][2 byte statusLen][status][4 byte reqIndex][2 byte groupIdLen][groupId]
		MSG_SERVER_PUSH_GROUP_SYSTEM_MSG_FIN: i++,

		//========END 返回给用户的协议 END========

		//Server has received the msg from A,notify A
		//[MSG_SERVER_MSG_RECEIVED][2 byte toUserIdLen][to userId][4 byte server timestamp][4 byte msg index]
		MSG_SERVER_MSG_RECEIVED: i++,

		//server trans msg to B
		//[MSG_SERVER_TRANS_MSG_TO_FAR][8 byte msgNode Add][4 byte server timestamp][1 byte msgType]{n byte msg type staff}[4 byte msgLen][msg]
		//msgType:
		//MSG_TYPE_SINGLE_CHAT			单聊消息		msg type staff: [2 byte from userIdLen][from userId][1 byte encryptType]{n byte encrypt staff}
		//MSG_TYPE_GROUP_CHAT			群消息			msg type staff: [2 byte groupIdLen][groupId][2 byte from userIdLen][from userId][1 byte encryptType]{n byte encrypt staff}
		//MSG_TYPE_PRIVATE_GROUP_CHAT	群私信消息		msg type staff: [2 byte groupIdLen][groupId][2 byte from userIdLen][from userId][1 byte encryptType]{n byte encrypt staff}
		//MSG_TYPE_GROUP_INFO_PUSH		推送群信息		msg type staff: [2 byte groupIdLen][groupId]
		//MSG_TYPE_SYSTEM_INFO_PUSH		推送系统信息	msg type staff: null
		//其中:
		//encryptType == ENCRYPT_TYPE_NONE			无加密			encrypt staff: null
		//encryptType == ENCRYPT_TYPE_AES_128_CFB	AES-128-CFB		encrypt staff: [2 byte AES key version][20 byte AES HMAC]
		MSG_SERVER_TRANS_MSG_TO_FAR: i++,

		//B has received the msg from A,notify the msgServer
		//[MSG_FAR_RECEIVED_MSG][2 byte userIdLen][userId][8 byte msgNode Add]
		MSG_FAR_RECEIVED_MSG: i++,

		//Error code:
		//[MSG_ERR][2 byte errId][2 byte errStringLen][errString]
		//errid查阅AErr.h
		MSG_ERR: i++,

		//msgServer alive:
		//[MSG_ALIVE_SERVER][2 byte serverID] //服务器间心跳包
		MSG_ALIVE_SERVER: i++,


		//[MSG_SERVER_KEY_EXPIRED]Server has received the msg from A, but encrypt key is expired, notify A
		//[2 byte toUserIdLen][to userId][4 byte msg index]
		MSG_SERVER_KEY_EXPIRED: i++,

		//消息服务
		//[MONITOR_MSG_MOON_SERVER_HELLO]
		MONITOR_MSG_MOON_SERVER_HELLO: i++,

		//设置推送策略
		//[MSG_SERVER_SET_PUSH_MODE][1 byte pushMode]
		MSG_SERVER_SET_PUSH_MODE: i++,

		//[MSG_SERVER_SET_PUSH_MODE_FIN]
		MSG_SERVER_SET_PUSH_MODE_OK: i++,

		//[MSG_SERVER_SET_PUSH_MODE_FAILED]
		MSG_SERVER_SET_PUSH_MODE_FAILED: i++,

		//[MSG_SERVER_GET_PUSH_MODE]
		MSG_SERVER_GET_PUSH_MODE: i++,

		//[MSG_SERVER_GET_PUSH_MODE_FIN][1 byte pushMode]
		MSG_SERVER_GET_PUSH_MODE_FIN: i++,


		//后加的协议（群操作）
		//user获取其加入的所有group列表
		//[MSG_CLIENT_GROUP_GET_GROUP_LIST][4 byte reqIndex][2 byte reqUserIdLen][reqUserId]
		MSG_CLIENT_GROUP_GET_GROUP_LIST: i++,

		//[MSG_CLIENT_GROUP_GET_GROUP_LIST_FIN][2 byte statusLen][status][4 byte reqIndex][4 byte groupIdListLen][groupIdList][4 byte groupNameListLen][groupNameList][4 byte creatorListLen][creatorIdList]
		MSG_CLIENT_GROUP_GET_GROUP_LIST_FIN: i++,

		//获取某groupId内所有的userId成员
		//[MSG_CLIENT_GROUP_GET_USER_LIST][4 byte reqIndex][2 byte reqUserIdLen][reqUserId][2 byte groupIdLen][groupId]
		MSG_CLIENT_GROUP_GET_USER_LIST: i++,

		//[MSG_CLIENT_GROUP_GET_USER_LIST_FIN][2 byte statusLen][status][4 byte reqIndex][4 byte userIdListLen][userIdList]
		MSG_CLIENT_GROUP_GET_USER_LIST_FIN: i++,

		//查询在线人数
		//[MSG_CLIENT_GET_ALIVE_NUMBER]
		MSG_CLIENT_GET_ALIVE_NUMBER: i++,

		//[MSG_CLIENT_GET_ALIVE_NUMBER_FIN][4 byte count][2 byte totalPageNum]
		MSG_CLIENT_GET_ALIVE_NUMBER_FIN: i++,

		//获取在线的所有的userId,pageNum从1开始
		//[MSG_CLIENT_GET_ALL_USER_LIST][2 byte reqPageNum]
		MSG_CLIENT_GET_ALL_USER_LIST: i++,

		//[MSG_CLIENT_GET_ALL_USER_LIST_OK][2 byte totalPageNum][2 byte reqPageNum][4 byte userIdListLen][userIdList]
		MSG_CLIENT_GET_ALL_USER_LIST_OK: i++,

		//[MSG_CLIENT_GET_ALL_USER_LIST_FAILED][2 byte totalPageNum][2 byte reqPageNum]
		MSG_CLIENT_GET_ALL_USER_LIST_FAILED: i++
	};
};

//==================================================================chatRoom server相关协议=====================================================================


if (typeof CHAT_ROOM_TYPE == "undefined") {
	var i = 1;
	var CHAT_ROOM_TYPE = {
		CHAT_ROOM_TYPE_PUBLIC: i++,//完全公开,未登录以游客形式登录
		CHAT_ROOM_TYPE_LOGIN: i++  //对所有登录用户公开
	}
};

//moonServer关闭room的条件是收到close的广播或此room的连接数为0
if (typeof AG_CHATROOMMOONSERVER == "undefined") {
	var i = 0;
	var AG_CHATROOMMOONSERVER = {
		//==================用户发送过来的二进制协议==================
		//创建聊天室
		//[CHATROOMMOONSERVER_CREATE_ROOM][2 byte userIdLen][userId][2 byte starToken len][starToken][1 byte roomType][2 byte conCurrentNum][4 byte userDefineDataLen][userDefineData]
		CHATROOMMOONSERVER_CREATE_ROOM: i++,

		//房间创建者删除聊天室
		//[CHATROOMMOONSERVER_DELETE_ROOM]
		CHATROOMMOONSERVER_DELETE_ROOM: i++,

		//房间创建者设置禁言(单位秒),仅CHAT_ROOM_TYPE_LOGIN模式有效
		//[CHATROOMMOONSERVER_BAN_TO_SEND_MSG][2 byte banUserIdLen][banUserId][2 byte banTime]
		CHATROOMMOONSERVER_BAN_TO_SEND_MSG: i++,

		//房间创建者踢人, 仅CHAT_ROOM_TYPE_LOGIN模式有效，踢出后此用户无法再进入房间
		//[CHATROOMMOONSERVER_KICKOUT_USER][2 byte kickOutUserIdLen][kickOutUserId]
		CHATROOMMOONSERVER_KICKOUT_USER: i++,

		//发送alive
		//[CHATROOMMOONSERVER_ALIVE]
		CHATROOMMOONSERVER_ALIVE: i++,

		//普通用户加入聊天室
		//[CHATROOMMOONSERVER_JOIN_ROOM][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte roomId]
		CHATROOMMOONSERVER_JOIN_ROOM: i++,

		//加入公开聊天室
		//登陆用户和游客都能加入公开聊天室，但游客临时userId必须由agent自己传过来
		//[CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM][2 byte userIdLen][userId][16 byte roomId]
		CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM: i++,

		//普通用户离开聊天室
		//[CHATROOMMOONSERVER_LEAVE_ROOM]
		CHATROOMMOONSERVER_LEAVE_ROOM: i++,

		//发消息
		//[CHATROOMMOONSERVER_SEND_MSG][4 byte msgLen][msg]
		CHATROOMMOONSERVER_SEND_MSG: i++,

		//发私信
		//[CHATROOMMOONSERVER_SEND_PRIVATE_MSG][2 byte toUserIdLen][toUserId][4 byte msgLen][msg]
		CHATROOMMOONSERVER_SEND_PRIVATE_MSG: i++,

		//获取roomId的在线人数，此值为大概值，为当前这个服务该roomId的人数乘以moon服务总数量，如果调度是平均分配，那么相对准确
		//[CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM][16 byte roomId]
		CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM: i++,

		//==================发送给用户的二进制协议==================
		//告诉用户申请流成功
		//[CHATROOMMOONSERVER_CREATE_ROOM_OK][16 byte roomId][2 byte maxContentLen]
		CHATROOMMOONSERVER_CREATE_ROOM_OK: i++,

		//[CHATROOMMOONSERVER_CREATE_ROOM_FAILED][2 byte statusLen][status]
		CHATROOMMOONSERVER_CREATE_ROOM_FAILED: i++,

		//[CHATROOMMOONSERVER_DELETE_ROOM_OK][16 byte roomId]
		CHATROOMMOONSERVER_DELETE_ROOM_OK: i++,

		//[CHATROOMMOONSERVER_DELETE_ROOM_FAILED][16 byte roomId][2 byte statusLen][status]
		CHATROOMMOONSERVER_DELETE_ROOM_FAILED: i++,

		//[CHATROOMMOONSERVER_BAN_TO_SEND_MSG_OK][2 byte banUserIdLen][banUserId][2 byte banTime]
		CHATROOMMOONSERVER_BAN_TO_SEND_MSG_OK: i++,

		//[CHATROOMMOONSERVER_BAN_TO_SEND_MSG_FAILED][2 byte banUserIdLen][banUserId][2 byte banTime][2 byte statusLen][status]
		CHATROOMMOONSERVER_BAN_TO_SEND_MSG_FAILED: i++,

		//[CHATROOMMOONSERVER_KICKOUT_USER_OK][2 byte kickOutUserIdLen][kickOutUserId]
		CHATROOMMOONSERVER_KICKOUT_USER_OK: i++,

		//[CHATROOMMOONSERVER_KICKOUT_USER_FAILED][2 byte kickOutUserIdLen][kickOutUserId][2 byte statusLen][status]
		CHATROOMMOONSERVER_KICKOUT_USER_FAILED: i++,

		//[CHATROOMMOONSERVER_JOIN_ROOM_OK][16 byte roomId][2 byte maxContentLen]
		CHATROOMMOONSERVER_JOIN_ROOM_OK: i++,

		//[CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM_OK][16 byte roomId][2 byte maxContentLen]
		CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM_OK: i++,

		//[CHATROOMMOONSERVER_JOIN_ROOM_FAILED][16 byte roomId][2 byte statusLen][status]
		CHATROOMMOONSERVER_JOIN_ROOM_FAILED: i++,

		//[CHATROOMMOONSERVER_ALIVE_FIN]
		CHATROOMMOONSERVER_ALIVE_FIN: i++,

		//[CHATROOMMOONSERVER_TRANS_PRIVATE_MSG_TO_FAR][2 byte fromUserIdLen][fromUserId][4 byte msgLen][msg]
		CHATROOMMOONSERVER_TRANS_PRIVATE_MSG_TO_FAR: i++,

		//[CHATROOMMOONSERVER_TRANS_MSG_TO_FAR][2 byte fromUserIdLen][fromUserId][4 byte msgLen][msg]
		CHATROOMMOONSERVER_TRANS_MSG_TO_FAR: i++,

		//用户被禁言或发送太频繁被系统禁言
		//[CHATROOMMOONSERVER_BANNED_SEND_MSG][2 byte banTime]
		CHATROOMMOONSERVER_BANNED_SEND_MSG: i++,

		//用户被踢出聊天室
		//[CHATROOMMOONSERVER_KICKED]
		CHATROOMMOONSERVER_KICKED: i++,

		//发消息余额不足
		//[CHATROOMMOONSERVER_SEND_MSG_NO_FEE]
		CHATROOMMOONSERVER_SEND_MSG_NO_FEE: i++,

		//错误
		//[CHATROOMMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
		CHATROOMMOONSERVER_ERR: i++,

		//[CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM_OK][16 byte roomId][4 byte onlineNum]
		CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM_OK: i++,


		//==================moonServer之间的二进制协议==================
		//某moonServer新创建room后同步给其他moonServer
		//[CHATROOMMOONSERVER_EACH_ROOM_SYCN][16 byte roomId][1 byte roomType][2 byte conCurrentNum][2 byte createrUserIdLen][createrUserId]
		CHATROOMMOONSERVER_EACH_ROOM_SYNC: i++,

		//[CHATROOMMOONSERVER_EACH_ROOM_SEND_PRIVATE_MSG][16 byte roomId][2 byte fromUserIdLen][fromUserId][2 byte toUserIdLen][toUserId][4 byte msgLen][msg]
		CHATROOMMOONSERVER_EACH_ROOM_SEND_PRIVATE_MSG: i++,

		//[CHATROOMMOONSERVER_EACH_ROOM_SEND_MSG][16 byte roomId][2 byte fromUserIdLen][fromUserId][4 byte msgLen][msg]
		CHATROOMMOONSERVER_EACH_ROOM_SEND_MSG: i++,

		//[CHATROOMMOONSERVER_EACH_BAN_TO_SEND_MSG][2 byte banUserIdLen][banUserId][2 byte banTime]
		CHATROOMMOONSERVER_EACH_BAN_TO_SEND_MSG: i++,

		//[CHATROOMMOONSERVER_EACH_KICKOUT_USER][2 byte kickOutUserIdLen][kickOutUserId]
		CHATROOMMOONSERVER_EACH_KICKOUT_USER: i++,

		//[CHATROOMMOONSERVER_EACH_ROOM_CLOSE][16 byte roomId]
		CHATROOMMOONSERVER_EACH_ROOM_CLOSE: i++,

		//聊天室服务
		//[MONITOR_CHATROOM_MOON_SERVER_HELLO]
		MONITOR_CHATROOM_MOON_SERVER_HELLO: i++,

		//保存列表信息（如聊天室列表、在线会议列表、互动直播列表）
		CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST: i++,
		//[CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST][2 byte listType][2 byte userIdLen][userId][16 byte roomId][4 byte userDefineDataLen][userDefineData]

		CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_OK: i++,
		//[CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_OK][16 byte roomId]

		CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_FAILED: i++,
		//[CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_FAILED][16 byte roomId]

		//删除列表信息（如聊天室列表、在线会议列表、互动直播列表）
		CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST: i++,
		//[CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST][2 byte listType][2 byte userIdLen][userId][16 byte roomId]

		CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_OK: i++,
		//[CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_OK][16 byte roomId]

		CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_FAILED: i++,
		//[CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_FAILED][16 byte roomId]

		//获取全部聊天室列表
		CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST: i++,
		//[CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST][2 byte listTypesLen][listTypes][2 byte userIdLen][userId]

		//[CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST_FIN][4 byte listLen][list data]
		CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST_FIN: i++
	};
};
//==================================================================END chatRoom server相关协议 END=============================================================


//==================================================================voipMoonServer相关协议=====================================================================



//呼叫方发送CALLING,等待CALLING_ACK后应用层通过消息告诉responser，接收方收到后发送RESPONSEING,如果成功，呼叫方和接收方都会收到CALLING_OK和RESPONSEING_OK
//应用层收到OK后就可以UPLOADING数据了
if (typeof AG_VOIPMOONSERVER == "undefined") {
	var i = 0;
	var AG_VOIPMOONSERVER = {
		//监控
		//[VOIPMOONSERVER_STATUS_QUERY]
		VOIPMOONSERVER_STATUS_QUERY: i++,

		//[VOIPMOONSERVER_STATUS_DATA][2 byte voipPairsNumber]
		VOIPMOONSERVER_STATUS_DATA: i++,


		//==================用户发送过来的二进制协议==================
		//呼叫
		//[VOIPMOONSERVER_CALLING][2 byte callerUserIdLen][callerUserId][2 byte starToken len][starToken][2 byte responserUserIdLen][responserUserId][2 byte audioParamTagLen][audioParamTag][2 byte videoParamTagLen][videoParamTag]
		VOIPMOONSERVER_CALLING: i++,

		//webrtc呼叫
		//[VOIPMOONSERVER_CALLING_WEBRTC][2 byte callerUserIdLen][callerUserId][2 byte starToken len][starToken][2 byte responserUserIdLen][responserUserId][4 byte auidoSSRC][4 byte videoSSRC]
		VOIPMOONSERVER_CALLING_WEBRTC: i++,

		//应答
		//[VOIPMOONSERVER_RESPONSEING][2 byte responserUserIdLen][responserUserId][2 byte starToken len][starToken][2 byte callerUserIdLen][callerUserId][2 byte audioParamTagLen][audioParamTag][2 byte videoParamTagLen][videoParamTag]
		VOIPMOONSERVER_RESPONSEING: i++,

		//webrtc应答
		//[VOIPMOONSERVER_RESPONSEING_WEBRTC][2 byte responserUserIdLen][responserUserId][2 byte starToken len][starToken][2 byte callerUserIdLen][callerUserId][4 byte auidoSSRC][4 byte videoSSRC]
		VOIPMOONSERVER_RESPONSEING_WEBRTC: i++,

		//上传
		//[VOIPMOONSERVER_CALLER_UPLOADING][4 byte responserUserCfd][4 byte responserConnToken][1 byte streamDataType][streamData]
		VOIPMOONSERVER_CALLER_UPLOADING: i++,

		//[VOIPMOONSERVER_RESPONSER_UPLOADING][4 byte callerUserCfd][4 byte callerConnToken][1 byte streamDataType][streamData]
		VOIPMOONSERVER_RESPONSER_UPLOADING: i++,


		//用户关闭通话, isActive为1表示主动挂断，0表示被动
		//[VOIPMOONSERVER_STOP][1 byte isActive]
		VOIPMOONSERVER_STOP: i++,

		//==================发送给用户的二进制协议==================
		//[VOIPMOONSERVER_CALLING_ACK]
		VOIPMOONSERVER_CALLING_ACK: i++,

		//[VOIPMOONSERVER_CALLING_OK][4 byte responserUserCfd][4 byte responserConnToken][2 byte farAudioParamTagLen][farAudioParamTag][2 byte farVideoParamTagLen][farVideoParamTag]
		VOIPMOONSERVER_CALLING_OK: i++,

		//[VOIPMOONSERVER_CALLING_WEBRTC_OK][2 byte fingerprintLen][fingerprint]
		VOIPMOONSERVER_CALLING_WEBRTC_OK: i++,

		//[VOIPMOONSERVER_CALLING_FAILED][2 byte errId][2 byte errStringLen][errString]
		VOIPMOONSERVER_CALLING_FAILED: i++,

		//[VOIPMOONSERVER_RESPONSEING_OK][4 byte callerUserCfd][4 byte callerConnToken][2 byte farAudioParamTagLen][farAudioParamTag][2 byte farVideoParamTagLen][farVideoParamTag]
		VOIPMOONSERVER_RESPONSEING_OK: i++,

		//[VOIPMOONSERVER_RESPONSEING_WEBRTC_OK][2 byte fingerprintLen][fingerprint]
		VOIPMOONSERVER_RESPONSEING_WEBRTC_OK: i++,

		//[VOIPMOONSERVER_RESPONSEING_FAILED][2 byte errId][2 byte errStringLen][errString]
		VOIPMOONSERVER_RESPONSEING_FAILED: i++,

		//[VOIPMOONSERVER_DOWNLOADING][1 byte streamDataType][streamData]
		VOIPMOONSERVER_DOWNLOADING: i++,

		//[VOIPMOONSERVER_SUGGEST_BITRATE][2 byte suggestFramerate][2 byte suggestBitrate]
		VOIPMOONSERVER_SUGGEST_BITRATE: i++,

		//错误
		//[VOIPMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
		VOIPMOONSERVER_ERR: i++,



		//用户请求双向网速测试
		//packetNumber最大值为100
		//packetSize最大值为100000
		//[VOIPMOONSERVER_NET_SPEED_TEST_REQ][4 byte packetNumber][4 byte packetSize]
		VOIPMOONSERVER_NET_SPEED_TEST_REQ: i++,

		//服务器返回，允许网速测试
		//[VOIPMOONSERVER_NET_SPEED_TEST_REQ_OK][4 byte userIP]
		VOIPMOONSERVER_NET_SPEED_TEST_REQ_OK: i++,

		//双方互发2M(100k*20)个数据包
		//[VOIPMOONSERVER_NET_SPEED_TEST_DATA][packetSize bytes]
		VOIPMOONSERVER_NET_SPEED_TEST_DATA: i++,

		//服务器每收到1个包就回复一次
		//[VOIPMOONSERVER_NET_SPEED_TEST_REPORT][4 byte currPacketIndex][4 byte currPacketSpeed(Bps)][4 byte totalSpeed(Bps)]
		VOIPMOONSERVER_NET_SPEED_TEST_REPORT: i++,



		//P2P
		//[VOIPMOONSERVER_CALLING_P2P_APPLY][4 byte farUserCfd][4 byte farConnToken]
		VOIPMOONSERVER_CALLING_P2P_APPLY: i++,

		//[VOIPMOONSERVER_RESPONSEING_P2P_CAN_CREATE][4 byte farUserCfd][4 byte farConnToken][4 byte responserOutIP][2 byte responserAPort][2 byte responserBPort][4 byte responserLocalIP][2 byte responserLocalAPort]
		VOIPMOONSERVER_RESPONSEING_P2P_CAN_CREATE: i++,


		//[VOIPMOONSERVER_CALLING_P2P_NOW_KNOCK_A][4 byte farUserCfd][4 byte farConnToken][4 byte callerOutIP][2 byte callerAPort][2 byte callerBPort]
		VOIPMOONSERVER_CALLING_P2P_NOW_KNOCK_A: i++,

		//端口默认用A通道
		//[VOIPMOONSERVER_CALLING_P2P_NOW_KNOCK_LOCAL][4 byte farUserCfd][4 byte farConnToken][4 byte callerLocalIP][2 byte callerLocalAPort]
		VOIPMOONSERVER_CALLING_P2P_NOW_KNOCK_LOCAL: i++,

		//双方互发50个数据包(500k,每100ms一个包，共5秒)
		//接收方在VOIPMOONSERVER_P2P_SPEED_TEST_START时开始计时，到收到总包数等于N时计算结果
		//[VOIPMOONSERVER_P2P_SPEED_TEST_START]
		VOIPMOONSERVER_P2P_SPEED_TEST_START: i++,
		//[VOIPMOONSERVER_P2P_SPEED_TEST_DATA][10000 bytes]
		VOIPMOONSERVER_P2P_SPEED_TEST_DATA: i++,

		//告诉对方具备能力给我发送数据
		//[VOIPMOONSERVER_P2P_SPEED_TEST_YES_YOU_CAN][2 byte speedRate]
		VOIPMOONSERVER_P2P_SPEED_TEST_YES_YOU_CAN: i++,

		//对方开始使用P2P通道发送数据
		//[VOIPMOONSERVER_NET_SWITCH_P2P]
		VOIPMOONSERVER_NET_SWITCH_P2P: i++,

		//对方即将开始使用中转通道发送数据
		//[VOIPMOONSERVER_NET_SWITCH_SERVER_TURN]
		VOIPMOONSERVER_NET_SWITCH_SERVER_TURN: i++,


		//心跳保活
		//如果使用P2P通道，则turn通道需要保活和AEC打点扣费
		//[VOIPMOONSERVER_NET_CALLER_SERVER_TURN_ALIVE][4 byte responserUserCfd]
		VOIPMOONSERVER_NET_CALLER_SERVER_TURN_ALIVE: i++,

		//[VOIPMOONSERVER_NET_RESPONSER_SERVER_TURN_ALIVE]
		VOIPMOONSERVER_NET_RESPONSER_SERVER_TURN_ALIVE: i++,

		//[VOIPMOONSERVER_NET_CALLER_SERVER_TURN_ALIVE_FIN]
		VOIPMOONSERVER_NET_CALLER_SERVER_TURN_ALIVE_FIN: i++,

		//[VOIPMOONSERVER_NET_RESPONSER_SERVER_TURN_ALIVE_FIN]
		VOIPMOONSERVER_NET_RESPONSER_SERVER_TURN_ALIVE_FIN: i++,


		//VOIP服务
		MONITOR_VOIP_MOON_SERVER_HELLO: i++,
		//[MONITOR_VOIP_MOON_SERVER_HELLO]

		//测试
		//[VOIPMOONSERVER_HELLO][2 byte dataLen][data]
		VOIPMOONSERVER_HELLO: i++,

		//[VOIPMOONSERVER_WORLD][2 byte dataLen][data]
		VOIPMOONSERVER_WORLD: i++
	}
};

//==================================================================END voipMoonServer相关协议 END=============================================================

//==================================================================liveSrcMoonServer相关协议==================================================================
//ly
if (typeof AG_LIVESRCMOONSERVER == "undefined") {
	var i = 0;
	var AG_LIVESRCMOONSERVER = {
		//=============moonServer接到liveSrcSchedule发过来的协议==============
		//查询liveSrc节点状态
		//[LIVESRCMOONSERVER_STATUS_QUERY]
		LIVESRCMOONSERVER_STATUS_QUERY: i++,

		//==================返回给liveSrcSchedule的二进制协议==================
		//liveSrcMoonServer发送状态信息给liveSrcSchedule
		//[LIVESRCMOONSERVER_STATUS_DATA][4 byte out bandwidth value][2 byte connected number][4 byte in bandwidth value][2 byte channel number]
		LIVESRCMOONSERVER_STATUS_DATA: i++,



		//============================liveSrcMoonServer接到liveVdnMoonServer发过来的协议==========================
		///liveVdnMoonServer向liveSrcMoonServer汇报该channelId的观众人数
		//[LIVESRCMOONSERVER_REPORT_CHANNEL_ONLINE_NUMBER][2 byte vdnMoonIndex][16 byte channelId][2 byte onlineNumber]
		LIVESRCMOONSERVER_REPORT_CHANNEL_ONLINE_NUMBER: i++,

		///liveVdnMoonServer向liveSrcMoonServer查询该channelId的观众总人数
		//[LIVESRCMOONSERVER_SYNC_CHANNEL_ONLINE_NUMBER][16 byte channelId]
		LIVESRCMOONSERVER_SYNC_CHANNEL_ONLINE_NUMBER: i++,

		//liveVdnMoonServer请求所需channelId的直播数据
		//[LIVESRCMOONSERVER_GET_CHANNEL][16 byte channelId]
		LIVESRCMOONSERVER_GET_CHANNEL_DATA: i++,

		//liveVdnMoonServer请求停止channelId的直播数据
		//[LIVESRCMOONSERVER_STOP_CHANNEL_DATA][2 byte vdnMoonIndex][16 byte channelId]
		LIVESRCMOONSERVER_STOP_CHANNEL_DATA: i++,

		//--------------此协议specify类型的channel需要到AEC验证-----------
		//验证此用户是否能获取channelId的内容
		//[LIVESRCMOONSERVER_APPLY_DOWNLOAD_CHANNEL][16 byte channelId][2 byte userIdLen][userId][2 byte starToken len][starToken]
		LIVESRCMOONSERVER_APPLY_DOWNLOAD_CHANNEL: i++,


		//发现siv版本号不对时vdn主动发送此协议请求更新streamInfo
		//[LIVESRCMOONSERVER_QUERY_STREAM_INFO][16 byte channelId]
		LIVESRCMOONSERVER_QUERY_STREAM_INFO: i++,




		//================================返回给liveVdnMoonServer的二进制协议==============================
		//如果上传者发送了LIVESRCMOONSERVER_CLOSE_CHANNEL或LIVESRCMOONSERVER_DELETE_CHANNEL:i++,那么src服务需要通知vdn服务此频道已关闭
		//[LIVESRCMOONSERVER_NOTIFY_CHANNEL_CLOSE][16 byte channelId]
		LIVESRCMOONSERVER_NOTIFY_CHANNEL_CLOSE: i++,

		//[LIVESRCMOONSERVER_SYNC_CHANNEL_ONLINE_NUMBER_FIN][16 byte channelId][1 byte channelIsExist][4 byte channelTotalOnlineNum]
		LIVESRCMOONSERVER_SYNC_CHANNEL_ONLINE_NUMBER_FIN: i++,

		//如果若干时间内未收到上传者的数据，则通知vdn服务此频道已离开
		//[LIVESRCMOONSERVER_NOTIFY_CHANNEL_LEAVE][16 byte channelId]
		LIVESRCMOONSERVER_NOTIFY_CHANNEL_LEAVE: i++,

		//conCurrentNum等于0表示人数无限制
		//[LIVESRCMOONSERVER_GET_CHANNEL_DATA_OK][16 byte channelId][2 byte conCurrentNumber][1 byte siv][1 byte upid][2 byte upUserIdLen][upUserId][2 byte avParamLen][upAvParam]
		//																								 ......
		//																								 [1 byte upid][2 byte upUserIdLen][upUserId][2 byte avParamLen][upAvParam]

		LIVESRCMOONSERVER_GET_CHANNEL_DATA_OK: i++,

		//[LIVESRCMOONSERVER_GET_CHANNEL_DATA_FAILED][16 byte channelId]
		LIVESRCMOONSERVER_GET_CHANNEL_DATA_FAILED: i++,

		//[LIVESRCMOONSERVER_STOP_CHANNEL_DATA_FIN][16 byte channelId]
		LIVESRCMOONSERVER_STOP_CHANNEL_DATA_FIN: i++,

		//channel信息变动,src通知vdn更新相关信息和参数
		//[LIVESRCMOONSERVER_NOTIFY_VDN_STREAM_INFO_UPDATE][16 byte channelId][2 byte conCurrentNumber][1 byte siv][1 byte upId][2 byte upUserIdLen][upUserId][2 byte avParamLen][upAvParam]
		//																										   ......
		//																										   [1 byte upId][2 byte upUserIdLen][upUserId][2 byte avParamLen][upAvParam]
		LIVESRCMOONSERVER_NOTIFY_VDN_STREAM_INFO_UPDATE: i++,


		//发送此channel的数据到liveVdnMoonServer
		//[LIVESRCMOONSERVER_SEND_CHANNEL_DATA][16 byte channelId][1 byte upId][1 byte siv][1 byte streamDataType][streamData]
		LIVESRCMOONSERVER_SEND_CHANNEL_DATA: i++,

		//state见APPLY_DOWNLOAD_CHANNEL状态
		//[LIVESRCMOONSERVER_APPLY_DOWNLOAD_CHANNEL_FIN][2 byte status][16 byte channelId][2 byte userIdLen][userId]
		LIVESRCMOONSERVER_APPLY_DOWNLOAD_CHANNEL_FIN: i++,






		//==================用户发送过来的二进制协议==================

		//--------------以下协议需要到AEC验证-----------
		//新建GLOBAL_PUBLIC直播流
		//conCurrentNum等于0表示人数无限制
		//[LIVESRCMOONSERVER_CREATE_CHANNEL_GLOBAL_PUBLIC][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte conCurrentNumber][2 byte validTime][2 byte roomIdLen][roomId][1 byte roomLiveType][2 byte extraLen][extra]
		LIVESRCMOONSERVER_CREATE_CHANNEL_GLOBAL_PUBLIC: i++,

		//新建LOGIN_PUBLIC直播流
		//conCurrentNum等于0表示人数无限制
		//[LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_PUBLIC][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte conCurrentNumber][2 byte validTime][2 byte roomIdLen][roomId][1 byte roomLiveType][2 byte extraLen][extra]
		LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_PUBLIC: i++,

		//新建LOGIN_SPECIFY直播流
		//conCurrentNum等于0表示人数无限制
		//[LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_SPECIFY][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte conCurrentNumber][2 byte validTime][2 byte roomIdLen][roomId][2 byte extraLen][extra][2 byte specLen][spec]
		LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_SPECIFY: i++,

		//新建GROUP_PUBLIC群直播流
		//[LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_PUBLIC][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte validTime][2 byte groupIdLen][groupId][2 byte extraLen][extra]
		LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_PUBLIC: i++,

		//新建GROUP_SPECIFY群直播流
		//[LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_SPECIFY][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte validTime][2 byte groupIdLen][groupId][2 byte extraLen][extra][2 byte specLen][spec]
		LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_SPECIFY: i++,

		//请求上传流
		//[LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId][2 byte avParamLen][avParam]
		LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL: i++,

		//webrtc请求上传流
		//[LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId][4 byte audioSSRC][4 byte videoSmallSSRC][4 byte videoBigSSRC]
		LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL: i++,

		//设置连麦上传者,一个channel最多LIVE_UPLOADER_CONCURRENT_MAX个连麦者
		//[LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER: i++,

		//清除某channel上传者
		//[LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER: i++,

		//静音某channel上传者
		//[LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER: i++,

		//取消静音某channel上传者
		//[LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER: i++,

		//关闭直播流
		//[LIVESRCMOONSERVER_CLOSE_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId]
		LIVESRCMOONSERVER_CLOSE_CHANNEL: i++,

		//删除直播流
		//[LIVESRCMOONSERVER_DELETE_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId]
		LIVESRCMOONSERVER_DELETE_CHANNEL: i++,


		//收到LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK后，用此协议设置组播流的详细配置,默认情况下都只传小图视频
		//LIVE_STREAM_CONFIG每个byte表示某个upId需要大图还是小图,16 byte表示最多支持16人同时连麦
		//[LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY][16 byte LIVE_STREAM_CONFIG]
		LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY: i++,


		//[LIVESRCMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER][16 byte channelId]
		LIVESRCMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER: i++,
		//--------------以上协议需要到AEC验证-----------






		//admin在服务器返回LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK后开始发送此协议传输数据
		//连麦: admin收到LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER_OK，然后通知连麦用户发送LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL并收到LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK后上传数据
		//[LIVESRCMOONSERVER_UPLOAD_STREAM][1 byte streamDataType][streamData]
		LIVESRCMOONSERVER_UPLOAD_STREAM: i++,

		//发送alive
		//[LIVESRCMOONSERVER_ALIVE]
		LIVESRCMOONSERVER_ALIVE: i++,



		//==================返回给用户的二进制协议==================
		//返回新建直播流成功
		//[LIVESRCMOONSERVER_CREATE_CHANNEL_OK][16 byte channelId]
		//channelId格式	 16 byte base64([4 byte srcIp][2 byte port][4 byte timeValue][2 byte serialNum])
		//通过channelId可以知道该频道视频上传源地址
		LIVESRCMOONSERVER_CREATE_CHANNEL_OK: i++,

		//[LIVESRCMOONSERVER_CREATE_CHANNEL_FAILED][2 byte statusLen][status]
		LIVESRCMOONSERVER_CREATE_CHANNEL_FAILED: i++,

		//服务器返回，可以开始上传流
		//[LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK][16 byte channelId]
		LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK: i++,

		//服务器返回webrtc，可以开始上传流
		//[LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL_OK][16 byte channelId][2 byte fingerprintLen][fingerprint]
		LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL_OK: i++,

		//[LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_FAILED][2 byte statusLen][status][16 byte channelId]
		LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_FAILED: i++,

		//[LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER_OK][16 byte channelId][2 byte upUserIdLen][upUserId][1 byte upId]
		LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER_OK: i++,

		//[LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER_FAILED][2 byte statusLen][status][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER_FAILED: i++,

		//[LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER_OK][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER_OK: i++,

		//[LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER_FAILED][2 byte statusLen][status][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER_FAILED: i++,

		//[LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER_OK][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER_OK: i++,

		//[LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER_FAILED][2 byte statusLen][status][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER_FAILED: i++,

		//[LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER_OK][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER_OK: i++,

		//[LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER_FAILED][2 byte statusLen][status][16 byte channelId][2 byte upUserIdLen][upUserId]
		LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER_FAILED: i++,

		//连麦者被停止上传权限
		//[LIVESRCMOONSERVER_UPLOADER_UNSETED][16 byte channelId]
		LIVESRCMOONSERVER_UPLOADER_UNSETED: i++,

		//连麦者被静音
		//[LIVESRCMOONSERVER_UPLOADER_MUTED][16 byte channelId]
		LIVESRCMOONSERVER_UPLOADER_MUTED: i++,

		//连麦者被取消静音
		//[LIVESRCMOONSERVER_UPLOADER_UNMUTED][16 byte channelId]
		LIVESRCMOONSERVER_UPLOADER_UNMUTED: i++,


		//[LIVESRCMOONSERVER_DELETE_CHANNEL_OK][16 byte channelId]
		LIVESRCMOONSERVER_DELETE_CHANNEL_OK: i++,

		//[LIVESRCMOONSERVER_DELETE_CHANNEL_FAILED][2 byte statusLen][status][16 byte channelId]
		LIVESRCMOONSERVER_DELETE_CHANNEL_FAILED: i++,


		//组播流的详细配置请求成功
		//[LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY_OK][16 byte channelId]
		LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY_OK: i++,

		//[LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY_FAILED][16 byte channelId]
		LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY_FAILED: i++,


		//[LIVESRCMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER_FIN][16 byte channelId][4 byte totalOnlineNumber]
		LIVESRCMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER_FIN: i++,


		//传输数据过程中，若发现无vdn获取此channel数据，发送此协议让用户暂停上传流
		//[LIVESRCMOONSERVER_PAUSE_STREAM]
		LIVESRCMOONSERVER_PAUSE_STREAM: i++,

		//当有vdn请求获取此channel数据时，且此channel处于pause状态，则发送此协议，用户收到后会恢复正常数据填充
		//[LIVESRCMOONSERVER_RESUME_STREAM]
		LIVESRCMOONSERVER_RESUME_STREAM: i++,

		//通知用户停止传输流
		//[LIVESRCMOONSERVER_STOP_STREAM]
		LIVESRCMOONSERVER_STOP_STREAM: i++,

		//[LIVESRCMOONSERVER_ALIVE_FIN]
		LIVESRCMOONSERVER_ALIVE_FIN: i++,


		//src连麦者总会收到admin的大图和其他所有人的小图，不支持自定义用户的大图功能
		//当用户申请上传并收到LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK后 或 上传过程中streamInfo信息变更时通知当前连麦的用户更新streamInfo
		//[LIVESRCMOONSERVER_NOTIFY_UPER_STREAM_INFO_UPDATE][1 byte siv][1 byte upId][2 byte upUserIdLen][upUserId][2 byte avParamLen][avParam]
		//																......
		//																[1 byte upId][2 byte upUserIdLen][upUserId][2 byte avParamLen][avParam]
		LIVESRCMOONSERVER_NOTIFY_UPER_STREAM_INFO_UPDATE: i++,

		//连麦者间传输数据
		//[LIVESRCMOONSERVER_SEND_PEER_STREAM][1 byte upId][1 byte siv][1 byte streamDataType][streamData]
		LIVESRCMOONSERVER_SEND_PEER_STREAM: i++,

		//==================返回状态==================

		//[LIVESRCMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
		LIVESRCMOONSERVER_ERR: i++,



		//流上传服务
		MONITOR_LIVESRC_MOON_SERVER_HELLO: i++,
		//[MONITOR_LIVESRC_MOON_SERVER_HELLO]

	};
};

//==================================================================liveSrcMoonServer相关协议 end==============================================================
//==================================================================liveVdnMoonServer相关协议==================================================================
//ly
if (typeof AG_LIVEVDNMOONSERVER == "undefined") {
	var i = 0;
	var AG_LIVEVDNMOONSERVER = {
		//=============moonServer接到liveVdnSchedule发过来的协议==============
		//查询liveVdn节点状态
		//[LIVEVDNMOONSERVER_STATUS_QUERY]
		LIVEVDNMOONSERVER_STATUS_QUERY: i++,

		//==================返回给liveVdnSchedule的二进制协议==================
		//[LIVEVDNMOONSERVER_STATUS_DATA][4 byte out bandwidth value][2 byte connected number][4 byte in bandwidth value][2 byte channel number]
		LIVEVDNMOONSERVER_STATUS_DATA: i++,



		//与liveSrcMoonServer通信的协议见“liveSrcMoonServer协议正文”





		//==================用户发送过来的二进制协议==================

		//webrtc用户首先需要注册ssrc，vdn在收到该通道的数据后才能和websocket的cfd关联
		//[LIVEVDNMOONSERVER_WEBRTC_REG_SSRC][4 byte SSRC]
		LIVEVDNMOONSERVER_WEBRTC_REG_SSRC: i++,

		//用户请求获取流
		//[LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL][16 byte channelId][2 byte userIdLen][userId][2 byte starToken len][starToken]
		LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL: i++,


		//停止下载流
		//[LIVEVDNMOONSERVER_STOP_DOWNLOAD]
		LIVEVDNMOONSERVER_STOP_DOWNLOAD: i++,

		//[LIVEVDNMOONSERVER_ALIVE]
		LIVEVDNMOONSERVER_ALIVE: i++,

		//获取channel的在线人数
		//[LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER][16 byte channelId]
		LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER: i++,


		//收到LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_OK后，用此协议设置组播流的详细配置,默认情况下只传输admin的大图视频(admin的upId为0)
		//LIVE_STREAM_CONFIG每个byte表示某个upId需要大图还是小图,16 byte表示最多支持16人同时连麦
		//[LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY][16 byte LIVE_STREAM_CONFIG]
		LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY: i++,

		//发现siv版本号不对时用户主动发送此协议请求更新streamInfo
		//[LIVEVDNMOONSERVER_QUERY_STREAM_INFO][16 byte channelId]
		LIVEVDNMOONSERVER_QUERY_STREAM_INFO: i++,

		//==================发送给用户的二进制协议==================

		//webrtc注册ssrc成功
		//[LIVEVDNMOONSERVER_WEBRTC_REG_SSRC_OK][2 byte fingerprintLen][fingerprint]
		LIVEVDNMOONSERVER_WEBRTC_REG_SSRC_OK: i++,


		//告诉用户申请流成功
		//[LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_OK][16 byte channelId][1 byte siv][1 byte upid][2 byte upUserIdLen][upUserId]
		//																		......
		//																		[1 byte upid][2 byte upUserIdLen][upUserId]
		LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_OK: i++,


		//[LIVEVDNMOONSERVER_ALIVE_FIN]
		LIVEVDNMOONSERVER_ALIVE_FIN: i++,

		//告诉用户申请流失败
		//state见APPLY_DOWNLOAD_CHANNEL状态
		//[LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_FAILED][2 byte statusLen][status][16 byte channelId]
		LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_FAILED: i++,


		//组播流的详细配置请求成功
		//[LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_OK][16 byte channelId]
		LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_OK: i++,

		//[LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_FAILED][16 byte channelId]
		LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_FAILED: i++,


		//当streamInfo信息变更时通知所有下载此channel的用户更新streamInfo
		//[LIVEVDNMOONSERVER_NOTIFY_VIEWER_STREAM_INFO_UPDATE][16 byte channelId][1 byte siv][1 byte upid][2 byte upUserIdLen][upUserId]
		//																					 ......
		//																					 [1 byte upid][2 byte upUserIdLen][upUserId]
		LIVEVDNMOONSERVER_NOTIFY_VIEWER_STREAM_INFO_UPDATE: i++,



		//向用户发送流内容
		//[LIVEVDNMOONSERVER_SEND_STREAM][1 byte upId][1 byte siv][1 byte streamDataType][streamData]
		LIVEVDNMOONSERVER_SEND_STREAM: i++,

		//告诉用户此channel已经关闭
		//[LIVEVDNMOONSERVER_CHANNEL_CLOSE][16 byte channelId]
		LIVEVDNMOONSERVER_CHANNEL_CLOSE: i++,

		//告诉用户此channel已经若干秒未收到数据，显示主播暂时离开或网络连接中
		//[LIVEVDNMOONSERVER_CHANNEL_LEAVE][16 byte channelId]
		LIVEVDNMOONSERVER_CHANNEL_LEAVE: i++,

		//[LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER_FIN][16 byte channelId][4 byte totalOnlineNumber]
		LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER_FIN: i++,

		//==================返回状态==================
		//返回请求成功
		//[LIVEVDNMOONSERVER_ACTION_OK][2 byte actionId]
		LIVEVDNMOONSERVER_ACTION_OK: i++,

		//[LIVEVDNMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
		LIVEVDNMOONSERVER_ERR: i++,





		//流下载服务
		MONITOR_LIVEVDN_MOON_SERVER_HELLO: i++,
		//[MONITOR_LIVEVDN_MOON_SERVER_HELLO]
	};
};

//==================================================================liveVdnMoonServer相关协议 end==============================================================


StarRtc.AUtils = new function () {
	var self = this;

	var agentId = "";
	var userId = "";
	var starUid = "";
	var starToken = "";

	self.msgMaxLen = 0;

	self.setUserInfo = function (_agentId, _userId, _starToken) {
		agentId = _agentId;
		userId = _userId;
		starUid = _agentId + "_" + _userId;
		starToken = _starToken;
	};

	self.clear = function () {
		agentId = "";
		userId = "";
		starUid = "";
		starToken = "";
		self.msgMaxLen = 0;
		stopHeartBeat();
	}

	//-----------------------------------第一层协议----------------------------------------------
	//APP产品编号	长度		APP版本	Reserved1	Reserved2	命令组	 正文	结束符
	//0xFF	        0xFFFFFFFF	0xFF	0xFFFF	    0xFFFF	    0xFF	 ...	0x1234
	//长度表示数据包的长度，包括len本身的4个byte直到结束符的长度

	//Top协议解析
	self.parseProtocol = function (_bytes, callback) {
		//将字符串转换成 Blob对象
		var blob = new Blob([_bytes], {
			type: 'text/plain'
		});
		//将Blob 对象转换成 ArrayBuffer
		var reader = new FileReader();
		reader.readAsArrayBuffer(blob);
		reader.onload = function (e) {
			var revUnit8Arr = new Uint8Array(reader.result);
			console.info("parseProtocol:", revUnit8Arr);
			var appid = revUnit8Arr[0];
			var plength = revUnit8Arr.slice(1, 5);
			var appver = revUnit8Arr[5];
			var rese1 = revUnit8Arr.slice(6, 8);
			var rese2 = revUnit8Arr.slice(8, 10);
			var actionid = revUnit8Arr[10];
			var msgArr = revUnit8Arr.slice(11, revUnit8Arr.byteLength - 2);
			console.info("parseProtocol: msgArr = ", msgArr);
			var end = revUnit8Arr.slice(revUnit8Arr.byteLength - 2, revUnit8Arr.byteLength);
			var protocolObj = {
				appid: appid,
				plength: plength,
				appver: appver,
				rese1: rese1,
				rese2: rese2,
				actionid: actionid,
				msgArr: msgArr,
				end: end
			}
			callback(protocolObj);
		}
	};

	//Top协议组装
	self.packageProtocol = function (_appid, _actionid, _msg) {
		var appid = _appid;
		var appver = 0x01;

		var rese1 = new Array(0xff, 0xff);
		var rese2 = new Array(0xff, 0xff);
		var actionid = _actionid;
		var end = new Array(0x12, 0x34);
		var msgArr = _msg;
		var msgUint8Arr = new Uint8Array(msgArr);
		var hex = (msgArr.byteLength + 12).toString(16);
		var fullHex = str_pad_8(hex);
		var plength = Str2Bytes(fullHex);

		var sendArrbuf = new ArrayBuffer(msgArr.byteLength + 13);
		var sendUint8Arr = new Uint8Array(sendArrbuf);

		sendUint8Arr[0] = appid;
		for (var i = 1; i < 5; i++) {
			sendUint8Arr[i] = plength[i - 1];
		}
		sendUint8Arr[5] = appver;
		sendUint8Arr[6] = rese1[0];
		sendUint8Arr[7] = rese1[1];
		sendUint8Arr[8] = rese2[0];
		sendUint8Arr[9] = rese2[1];
		sendUint8Arr[10] = actionid;
		for (var i = 11; i < 11 + msgUint8Arr.byteLength; i++) {
			sendUint8Arr[i] = msgUint8Arr[i - 11];
		}
		sendUint8Arr[11 + msgUint8Arr.byteLength] = 0x12;
		sendUint8Arr[12 + msgUint8Arr.byteLength] = 0x34;
		console.log("packageProtocol", sendUint8Arr);
		return sendUint8Arr;
	}
	//-----------------------------------第一层协议 end----------------------------------------------

	//-----------------------------------第二层协议----------------------------------------------
	//鉴权正文组装
	self.constructAuthMsg = function () {
		//[MSG_CLIENT_AUTH][2 byte userIdLen][userId][32 byte starToken]
		var ag_code = AG_MSG.MSG_CLIENT_AUTH;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));
		var userIdArr = stringToByte(starUid);
		var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));
		var starTokenArr = stringToByte(starToken);

		var authMsgUint8 = new Uint8Array(userIdArr.length + 36);
		var start = 0, end = agCodeArr.length;
		for (var i = start; i < end; i++) {
			authMsgUint8[i] = agCodeArr[i];
		}
		start = end;
		end = start + userIdLenArr.length;
		for (var i = start; i < end; i++) {
			authMsgUint8[i] = userIdLenArr[i - start];
		}
		start = end;
		end = start + userIdArr.length;
		for (var i = start; i < end; i++) {
			authMsgUint8[i] = userIdArr[i - start];
		}
		start = end;
		end = start + starTokenArr.length;
		for (var i = start; i < end; i++) {
			authMsgUint8[i] = starTokenArr[i - start];
		}

		var start = 0;
		var msgParams = [];

		msgParams.push(agCodeArr);
		msgParams.push(userIdLenArr);
		msgParams.push(userIdArr);
		msgParams.push(starTokenArr);

		packageParamsProtocol(authMsgUint8, start, msgParams);

		return authMsgUint8;
	}

	self.constructMsgProtocol = function (code, params) {
		var msgArr;
		var start = 0;
		var msgParams = [];

		var ag_code = code;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));

		var callerUserIdArr = stringToByte(starUid);
		var callerUserIdLenArr = Str2Bytes(str_pad_4(callerUserIdArr.length.toString(16)));

		var starTokenArr = stringToByte(starToken);
		var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

		switch (code) {

			//user请求创建群
			//reqIndex用于创建成功后返回给用户，表示请求流水号，用户用来区分是哪一条请求成功
			//[MSG_CLIENT_GROUP_CREATE][4 byte reqIndex][2 byte reqUserIdLen][reqUserId][4 byte addUsersLen][addUsers][4 byte userDefineDataLen][userDefineData]
			case AG_MSG.MSG_CLIENT_GROUP_CREATE:
				break;

			//user请求删除群
			//[MSG_CLIENT_GROUP_DEL][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId]
			case AG_MSG.MSG_CLIENT_GROUP_DEL:
				break;

			//user请求增加群成员
			//[MSG_CLIENT_GROUP_ADD_USER][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId][4 byte addUsersLen][addUsers][4 byte userDefineDataLen][userDefineData]
			case AG_MSG.MSG_CLIENT_GROUP_ADD_USER:
				break;

			//user请求删除群成员
			//[MSG_CLIENT_GROUP_REMOVE_USER][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId][4 byte removeUsersLen][removeUsers]
			case AG_MSG.MSG_CLIENT_GROUP_REMOVE_USER:
				break;

			//user请求开启群免打扰
			//[MSG_CLIENT_SET_GROUP_PUSH_IGNORE][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId]
			case AG_MSG.MSG_CLIENT_SET_GROUP_PUSH_IGNORE:
				break;

			//user请求关闭群免打扰
			//[MSG_CLIENT_UNSET_GROUP_PUSH_IGNORE][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId]
			case AG_MSG.MSG_CLIENT_UNSET_GROUP_PUSH_IGNORE:
				break;


			//user推送系统消息到指定用户
			//[MSG_CLIENT_PUSH_SYSTEM_MSG][4 byte reqIndex][2 byte reqUserIdLen][reqUserId][4 byte pushUsersLen][pushUsers][1 byte msgDataType][4 byte msgLen][msg]
			case AG_MSG.MSG_CLIENT_PUSH_SYSTEM_MSG:
				break;

			//user推送群系统消息到指定群
			//[MSG_CLIENT_PUSH_SYSTEM_GROUP_MSG][4 byte reqIndex][2 byte groupIdLen][groupId][2 byte reqUserIdLen][reqUserId][1 byte msgDataType][4 byte msgLen][msg]
			case AG_MSG.MSG_CLIENT_PUSH_SYSTEM_GROUP_MSG:
				break;

			//user发送群消息,atUserIds是指需要@的用户列表，用逗号分隔，用于免打扰用户的@推送
			//[MSG_CLIENT_SEND_GROUPMSG][2 byte atUserIdsLen][atUserIds][4 byte groupMsgIndex][2 byte groupIdLen][groupId][2 byte fromUserIdLen][fromUserId][1 byte encryptType]{n byte encrypt staff}[1 byte msgDataType][4 byte msgLen][msg]
			case AG_MSG.MSG_CLIENT_SEND_GROUPMSG:
				break;

			//后加的协议（群操作）
			//user获取其加入的所有group列表
			//[MSG_CLIENT_GROUP_GET_GROUP_LIST][4 byte reqIndex][2 byte reqUserIdLen][reqUserId]
			case AG_MSG.MSG_CLIENT_GROUP_GET_GROUP_LIST:

				var reqIndexArr = Str2Bytes(str_pad_8(params.reqIndex.toString(16)));

				msgArr = new Uint8Array(2 + 4 + (2 + callerUserIdArr.length));

				msgParams.push(agCodeArr);
				msgParams.push(reqIndexArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);

				break;

			//获取某groupId内所有的userId成员
			//[MSG_CLIENT_GROUP_GET_USER_LIST][4 byte reqIndex][2 byte reqUserIdLen][reqUserId][2 byte groupIdLen][groupId]
			case AG_MSG.MSG_CLIENT_GROUP_GET_USER_LIST:

				var reqIndexArr = Str2Bytes(str_pad_8(params.reqIndex.toString(16)));

				var groupIdArr = stringToByte(params.groupId);
				var groupIdLenArr = Str2Bytes(str_pad_4(groupIdArr.length.toString(16)));

				msgArr = new Uint8Array(2 + 4 + (2 + callerUserIdArr.length) + (2 + groupIdArr.length));

				msgParams.push(agCodeArr);
				msgParams.push(reqIndexArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(groupIdLenArr);
				msgParams.push(groupIdArr);

				break;

			//查询在线人数
			//[MSG_CLIENT_GET_ALIVE_NUMBER]
			case AG_MSG.MSG_CLIENT_GET_ALIVE_NUMBER:

				msgArr = new Uint8Array(2);

				msgParams.push(agCodeArr);

				break;

			//获取在线的所有的userId,pageNum从1开始
			//[MSG_CLIENT_GET_ALL_USER_LIST][2 byte reqPageNum]
			case AG_MSG.MSG_CLIENT_GET_ALL_USER_LIST:

				msgArr = new Uint8Array(2 + 2);

				var reqPageNumArr = Str2Bytes(str_pad_4(params.reqPageNum.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(reqPageNumArr);

				break;

		}
		packageParamsProtocol(msgArr, start, msgParams);

		return msgArr
	}


	//消息正文组装
	//单聊消息
	self.constructSingleMsg = function (targetId, msgIndex, digest, msg, _type) {
		//A(or server) send msg
		//另一种是msgServer要送达的用户不在此服务器上，需要根据hash转发给其他msgServer，token
		//[MSG_CLIENT_SEND_MSG][2 byte from userIdLen][from userId][2 byte userIdLen][to userId][4 byte msg index][1 byte encryptType]{n byte encrypt staff}[1 byte msgDataType][4 byte msgLen][msg]
		//encryptType == ENCRYPT_TYPE_NONE			无加密			encrypt staff: null
		//encryptType == ENCRYPT_TYPE_AES_128_CFB	AES-128-CFB		encrypt staff: [2 byte AES key version][20 byte AES HMAC]

		var ag_code = AG_MSG.MSG_CLIENT_SEND_MSG;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));
		var userIdArr = stringToByte(starUid);
		var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));
		var targetIdArr = stringToByte(agentId + "_" + targetId);
		var targetIdLenArr = Str2Bytes(str_pad_4(targetIdArr.length.toString(16)));
		var msgIndexArr = Str2Bytes(str_pad_8(msgIndex.toString(16)));
		var encryptType = ENCRYPT_TYPE.ENCRYPT_TYPE_NONE;
		var msgType = MSG_DATA_TYPE.MSG_DATA_TYPE_CONTROL2;
		if (_type != undefined) {
			msgType = _type;
		}

		var msgObj = {
			"fromId": userId,
			"targetId": targetId,
			"time": "0",
			"msgIndex": msgIndex,
			"type": 1,
			"code": 0,
			"contentData": msg
		};
		var msgArr = constructMsgDataProtocol(digest, JSON.stringify(msgObj));
		var msgLenArr = Str2Bytes(str_pad_8(msgArr.length.toString(16)));

		var msgUint8 = new Uint8Array(userIdArr.length + targetIdArr.length + msgArr.length + 16);

		var start = 0;
		var msgParams = [];

		msgParams.push(agCodeArr);
		msgParams.push(userIdLenArr);
		msgParams.push(userIdArr);
		msgParams.push(targetIdLenArr);
		msgParams.push(targetIdArr);
		msgParams.push(msgIndexArr);
		msgParams.push([encryptType]);
		msgParams.push([msgType]);
		msgParams.push(msgLenArr);
		msgParams.push(msgArr);

		packageParamsProtocol(msgUint8, start, msgParams);

		return msgUint8;
	}

	//群聊消息
	self.constructGroupMsg = function (targetId, msgIndex, digest, msg) {
		//user发送群消息,atUserIds是指需要@的用户列表，用逗号分隔，用于免打扰用户的@推送
		//[MSG_CLIENT_SEND_GROUPMSG][2 byte atUserIdsLen][atUserIds][4 byte groupMsgIndex][2 byte groupIdLen][groupId][2 byte fromUserIdLen][fromUserId][1 byte encryptType]{n byte encrypt staff}[1 byte msgDataType][4 byte msgLen][msg]
		var ag_code = AG_MSG.MSG_CLIENT_SEND_GROUPMSG;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));
		var atUserIdArr = stringToByte("");
		var atUserIdLenArr = Str2Bytes(str_pad_4(atUserIdArr.length.toString(16)));
		var msgIndexArr = Str2Bytes(str_pad_8(msgIndex.toString(16)));
		var groupIdArr = stringToByte(agentId + "_" + targetId);
		var groupIdLenArr = Str2Bytes(str_pad_4(groupIdArr.length.toString(16)));
		var userIdArr = stringToByte(starUid);
		var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));

		var encryptType = ENCRYPT_TYPE.ENCRYPT_TYPE_NONE;
		var msgType = MSG_DATA_TYPE.MSG_DATA_TYPE_CONTROL2;

		var msgObj = {
			"fromId": userId,
			"targetId": targetId,
			"time": "0",
			"msgIndex": msgIndex,
			"type": 1,
			"code": 0,
			"contentData": msg
		};
		var msgArr = constructMsgDataProtocol(digest, JSON.stringify(msgObj));
		var msgLenArr = Str2Bytes(str_pad_8(msgArr.length.toString(16)));

		var msgUint8 = new Uint8Array(atUserIdArr.length + groupIdArr.length + userIdArr.length + msgArr.length + 18);

		var start = 0;
		var msgParams = [];

		msgParams.push(agCodeArr);
		msgParams.push(atUserIdLenArr);
		msgParams.push(atUserIdArr);
		msgParams.push(msgIndexArr);
		msgParams.push(groupIdLenArr);
		msgParams.push(groupIdArr);
		msgParams.push(userIdLenArr);
		msgParams.push(userIdArr);
		msgParams.push([encryptType]);
		msgParams.push([msgType]);
		msgParams.push(msgLenArr);
		msgParams.push(msgArr);

		packageParamsProtocol(msgUint8, start, msgParams);

		return msgUint8;
	}

	//组装消息回执
	self.constructReceivedMsg = function (data) {
		//B has received the msg from A,notify the msgServer
		//[MSG_FAR_RECEIVED_MSG][2 byte userIdLen][userId][8 byte msgNode Add]
		var ag_code = AG_MSG.MSG_FAR_RECEIVED_MSG;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));
		var userIdArr = stringToByte(starUid);
		var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));
		var dataArr = new Uint8Array(data);

		var msgArr = new Uint8Array(userIdArr.length + 12);

		var start = 0;
		var msgParams = [];

		msgParams.push(agCodeArr);
		msgParams.push(userIdLenArr);
		msgParams.push(userIdArr);
		msgParams.push(dataArr);

		packageParamsProtocol(msgArr, start, msgParams);

		return msgArr;
	}

	//消息正文组装
	//控制消息
	self.constructSingleCtrlMsg = function (targetId, msgIndex, digest, msg, code) {
		//A(or server) send msg
		//另一种是msgServer要送达的用户不在此服务器上，需要根据hash转发给其他msgServer，token
		//[MSG_CLIENT_SEND_MSG][2 byte from userIdLen][from userId][2 byte userIdLen][to userId][4 byte msg index][1 byte encryptType]{n byte encrypt staff}[1 byte msgDataType][4 byte msgLen][msg]
		//encryptType == ENCRYPT_TYPE_NONE			无加密			encrypt staff: null
		//encryptType == ENCRYPT_TYPE_AES_128_CFB	AES-128-CFB		encrypt staff: [2 byte AES key version][20 byte AES HMAC]

		var ag_code = AG_MSG.MSG_CLIENT_SEND_MSG;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));
		var userIdArr = stringToByte(starUid);
		var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));
		var targetIdArr = stringToByte(agentId + "_" + targetId);
		var targetIdLenArr = Str2Bytes(str_pad_4(targetIdArr.length.toString(16)));
		var msgIndexArr = Str2Bytes(str_pad_8(msgIndex.toString(16)));
		var encryptType = ENCRYPT_TYPE.ENCRYPT_TYPE_NONE;
		var msgType = MSG_DATA_TYPE.MSG_DATA_TYPE_CONTROL;

		var msgObj = {
			"fromId": userId,
			"targetId": targetId,
			"time": "0",
			"msgIndex": msgIndex,
			"type": 0,
			"code": parseInt(code),
			"contentData": msg
		};
		var msgArr = constructMsgDataProtocol(digest, JSON.stringify(msgObj));
		var msgLenArr = Str2Bytes(str_pad_8(msgArr.length.toString(16)));

		var msgUint8 = new Uint8Array(userIdArr.length + targetIdArr.length + msgArr.length + 16);
		var start = 0;
		var msgParams = [];

		msgParams.push(agCodeArr);
		msgParams.push(userIdLenArr);
		msgParams.push(userIdArr);
		msgParams.push(targetIdLenArr);
		msgParams.push(targetIdArr);
		msgParams.push(msgIndexArr);
		msgParams.push([encryptType]);
		msgParams.push([msgType]);
		msgParams.push(msgLenArr);
		msgParams.push(msgArr);

		packageParamsProtocol(msgUint8, start, msgParams);

		return msgUint8;
	}

	self.constructVOIPProtocol = function (code, params) {
		var msgArr;
		var start = 0;
		var msgParams = [];

		var ag_code = code;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));

		var callerUserIdArr = stringToByte(starUid);
		var callerUserIdLenArr = Str2Bytes(str_pad_4(callerUserIdArr.length.toString(16)));

		var starTokenArr = stringToByte(starToken);
		var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

		switch (code) {
			//webrtc呼叫
			//[VOIPMOONSERVER_CALLING_WEBRTC][2 byte callerUserIdLen][callerUserId][2 byte starToken len][starToken][2 byte responserUserIdLen][responserUserId][4 byte auidoSSRC][4 byte videoSmallSSRC][4 byte videoBigSSRC]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_CALLING_WEBRTC:
			//webrtc应答
			//[VOIPMOONSERVER_RESPONSEING_WEBRTC][2 byte responserUserIdLen][responserUserId][2 byte starToken len][starToken][2 byte callerUserIdLen][callerUserId][4 byte auidoSSRC][4 byte videoSmallSSRC][4 byte videoBigSSRC]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_RESPONSEING_WEBRTC:
				{

					var responserUserIdArr = stringToByte(agentId + "_" + params.targetId);
					var responserUserIdLenArr = Str2Bytes(str_pad_4(responserUserIdArr.length.toString(16)));

					var audioSSRCArr = Str2Bytes(str_pad_x(8, parseInt(params.audioSSRC).toString(16)));
					var videoSSRCArr = Str2Bytes(str_pad_x(8, parseInt(params.videoSSRC).toString(16)));

					var videoCodecArr = Str2Bytes(str_pad_x(2, parseInt(params.videoCodec).toString(16)));
					var audioCodecArr = Str2Bytes(str_pad_x(2, parseInt(params.audioCodec).toString(16)));

					msgArr = new Uint8Array(2 + (2 + callerUserIdArr.length) + (2 + starTokenArr.length) + (2 + responserUserIdArr.length) + 4 + 4 + 1 + 1);

					msgParams.push(agCodeArr);
					msgParams.push(callerUserIdLenArr);
					msgParams.push(callerUserIdArr);
					msgParams.push(starTokenLenArr);
					msgParams.push(starTokenArr);
					msgParams.push(responserUserIdLenArr);
					msgParams.push(responserUserIdArr);
					msgParams.push(audioSSRCArr);
					msgParams.push(videoSSRCArr);
					msgParams.push(videoCodecArr);
					msgParams.push(audioCodecArr);

				}
				break;
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_STOP:
				//用户关闭通话, isActive为1表示主动挂断，0表示被动
				//[VOIPMOONSERVER_STOP][1 byte isActive]
				var isActive = params.isActive;

				msgArr = new Uint8Array(2 + 1);

				msgParams.push(agCodeArr);
				msgParams.push([isActive]);
				break;
		}

		packageParamsProtocol(msgArr, start, msgParams);

		return msgArr;
	}

	self.constructSrcProtocol = function (code, params) {
		var msgArr;
		var start = 0;
		var msgParams = [];
		var validTime = 0;

		var ag_code = code;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));

		var callerUserIdArr = stringToByte(starUid);
		var callerUserIdLenArr = Str2Bytes(str_pad_4(callerUserIdArr.length.toString(16)));

		var starTokenArr = stringToByte(starToken);
		var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

		switch (code) {
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_GLOBAL_PUBLIC:
			//新建GLOBAL_PUBLIC直播流
			//conCurrentNum等于0表示人数无限制
			//[LIVESRCMOONSERVER_CREATE_CHANNEL_GLOBAL_PUBLIC][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte conCurrentNumber][2 byte validTime][2 byte roomIdLen][roomId][1 byte roomLiveType][2 byte extraLen][extra]
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_PUBLIC:
				//新建LOGIN_PUBLIC直播流
				//conCurrentNum等于0表示人数无限制
				//[LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_PUBLIC][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte conCurrentNumber][2 byte validTime][2 byte roomIdLen][roomId][1 byte roomLiveType][2 byte extraLen][extra]

				var conCurrentNumArr = Str2Bytes(str_pad_4(params.conCurrentNum.toString(16)));

				var validTimeArr = Str2Bytes(str_pad_4(validTime.toString(16)));

				var roomIdArr = stringToByte(params.roomId);
				var roomIdLenArr = Str2Bytes(str_pad_4(roomIdArr.length.toString(16)));

				var roomLiveTypeArr = params.liveType;

				var extraArr = stringToByte(params.extra);
				var extraLenArr = Str2Bytes(str_pad_4(extraArr.length.toString(16)));

				msgArr = new Uint8Array(2 + (2 + callerUserIdArr.length) + (2 + starTokenArr.length) + 2 + 2 + (2 + roomIdArr.length) + 1 + (2 + extraArr.length));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(conCurrentNumArr);
				msgParams.push(validTimeArr);
				msgParams.push(roomIdLenArr);
				msgParams.push(roomIdArr);
				msgParams.push([roomLiveTypeArr]);
				msgParams.push(extraLenArr);
				msgParams.push(extraArr);

				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_SPECIFY:
				//新建LOGIN_SPECIFY直播流
				//conCurrentNum等于0表示人数无限制
				//[LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_SPECIFY][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte conCurrentNumber][2 byte validTime][2 byte roomIdLen][roomId][2 byte extraLen][extra][2 byte specLen][spec]

				var conCurrentNumArr = Str2Bytes(str_pad_4(params.conCurrentNum.toString(16)));

				var validTimeArr = Str2Bytes(str_pad_4(params.validTime.toString(16)));

				var roomIdArr = stringToByte(params.roomId);
				var roomIdLenArr = Str2Bytes(str_pad_4(roomIdArr.length.toString(16)));

				var extraArr = stringToByte(params.extra);
				var extraLenArr = Str2Bytes(str_pad_4(extraArr.length.toString(16)));

				var specArr = stringToByte(params.spec);
				var specLenArr = Str2Bytes(str_pad_4(specArr.length.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(conCurrentNumArr);
				msgParams.push(validTimeArr);
				msgParams.push(roomIdLenArr);
				msgParams.push(roomIdArr);
				msgParams.push(extraLenArr);
				msgParams.push(extraArr);
				msgParams.push(specLenArr);
				msgParams.push(specArr);
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_PUBLIC:
				//新建GROUP_PUBLIC群直播流
				//[LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_PUBLIC][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte validTime][2 byte groupIdLen][groupId][2 byte extraLen][extra]

				var ag_code = code;
				var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));

				var callerUserIdArr = stringToByte(userId);
				var callerUserIdLenArr = Str2Bytes(str_pad_4(callerUserIdArr.length.toString(16)));

				var starTokenArr = stringToByte(starToken);
				var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

				var validTimeArr = Str2Bytes(str_pad_4(validTime.toString(16)));

				var groupIdArr = stringToByte(params.groupId);
				var groupIdLenArr = Str2Bytes(str_pad_4(groupIdArr.length.toString(16)));

				var extraArr = stringToByte(params.extra);
				var extraLenArr = Str2Bytes(str_pad_4(extraArr.length.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(validTimeArr);
				msgParams.push(groupIdLenArr);
				msgParams.push(groupIdArr);
				msgParams.push(extraLenArr);
				msgParams.push(extraArr);

				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_SPECIFY:
				//新建GROUP_SPECIFY群直播流
				//[LIVESRCMOONSERVER_CREATE_CHANNEL_GROUP_SPECIFY][2 byte userIdLen][userId][2 byte starToken len][starToken][2 byte validTime][2 byte groupIdLen][groupId][2 byte extraLen][extra][2 byte specLen][spec]

				var validTimeArr = Str2Bytes(str_pad_4(validTime.toString(16)));

				var groupIdArr = stringToByte(params.groupId);
				var groupIdLenArr = Str2Bytes(str_pad_4(groupIdArr.length.toString(16)));

				var extraArr = stringToByte(params.extra);
				var extraLenArr = Str2Bytes(str_pad_4(extraArr.length.toString(16)));

				var specArr = stringToByte(params.spec);
				var specLenArr = Str2Bytes(str_pad_4(specArr.length.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(validTimeArr);
				msgParams.push(groupIdLenArr);
				msgParams.push(groupIdArr);
				msgParams.push(extraLenArr);
				msgParams.push(extraArr);
				msgParams.push(specLenArr);
				msgParams.push(specArr);
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL:
				//请求上传流
				//[LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId][2 byte avParamLen][avParam]

				var channelIdArr = stringToByte(params.channelId);

				var avParamArr = stringToByte(params.avParam);
				var avParamLenArr = Str2Bytes(str_pad_4(avParamArr.length.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(channelIdArr);
				msgParams.push(avParamLenArr);
				msgParams.push(avParamArr);
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER:
				//设置连麦上传者,一个channel最多LIVE_UPLOADER_CONCURRENT_MAX个连麦者
				//[LIVESRCMOONSERVER_SET_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]

				var channelIdArr = stringToByte(params.channelId);

				var upUserIdArr = stringToByte(params.upUserId);
				var upUserIdLenArr = Str2Bytes(str_pad_4(upUserIdArr.length.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(channelIdArr);
				msgParams.push(upUserIdLenArr);
				msgParams.push(upUserIdArr);
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER:
			//清除某channel上传者
			//[LIVESRCMOONSERVER_UNSET_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER:
			//静音某channel上传者
			//[LIVESRCMOONSERVER_MUTE_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER:
				//取消静音某channel上传者
				//[LIVESRCMOONSERVER_UNMUTE_CHANNEL_UPLOADER][2 byte adminUserIdLen][adminUserId][2 byte starToken len][starToken][16 byte channelId][2 byte upUserIdLen][upUserId]

				var channelIdArr = stringToByte(params.channelId);

				var upUserIdArr = stringToByte(params.upUserId);
				var upUserIdLenArr = Str2Bytes(str_pad_4(upUserIdArr.length.toString(16)));

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(channelIdArr);
				msgParams.push(upUserIdLenArr);
				msgParams.push(upUserIdArr);

				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CLOSE_CHANNEL:
			//关闭直播流
			//[LIVESRCMOONSERVER_CLOSE_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId]
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_DELETE_CHANNEL:
				//删除直播流
				//[LIVESRCMOONSERVER_DELETE_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId]

				var channelIdArr = stringToByte(params.channelId);

				msgArr = new Uint8Array(2 + (2 + callerUserIdArr.length) + (2 + starTokenArr.length) + 16);

				msgParams.push(agCodeArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);
				msgParams.push(channelIdArr);

				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY:
				//收到LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_OK后，用此协议设置组播流的详细配置,默认情况下都只传小图视频
				//LIVE_STREAM_CONFIG每个byte表示某个upId需要大图还是小图,16 byte表示最多支持16人同时连麦
				//[LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY][16 byte LIVE_STREAM_CONFIG]

				var streamConfig = params.streamConfig;
				var streamConfigArr = new Uint8Array(16);

				for (var i = 0; i < 16; i++) {
					if (streamConfig[i] != undefined) {
						streamConfigArr[i] = streamConfig[i];
					}
					else {
						streamConfigArr[i] = 0;
					}
				}

				msgArr = new Uint8Array(2 + 16);

				msgParams.push(agCodeArr);
				msgParams.push(streamConfigArr);

				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER:
				//[LIVESRCMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER][16 byte channelId]

				var channelIdArr = stringToByte(params.channelId);

				msgParams.push(agCodeArr);
				msgParams.push(channelIdArr);
				//--------------以上协议需要到AEC验证-----------
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_ALIVE:
				//发送alive
				//[LIVESRCMOONSERVER_ALIVE]

				msgParams.push(agCodeArr);
				break;
			//[LIVESRCMOONSERVER_UPLOAD_STREAM][1 byte streamDataType][streamData]
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_UPLOAD_STREAM:

				var streamDataArr = stringToByte(params.streamData);

				msgArr = new Uint8Array(2 + 1 + streamDataArr.length);

				msgParams.push(agCodeArr);
				msgParams.push([params.streamDataType]);
				msgParams.push(streamDataArr);

				break;
		}

		packageParamsProtocol(msgArr, start, msgParams);

		return msgArr;

	}

	self.constructVdnProtocol = function (code, params) {
		var msgArr;
		var start = 0;
		var msgParams = [];

		var ag_code = code;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));

		var callerUserIdArr = stringToByte(starUid);
		var callerUserIdLenArr = Str2Bytes(str_pad_4(callerUserIdArr.length.toString(16)));

		var starTokenArr = stringToByte(starToken);
		var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

		switch (code) {
			//webrtc用户首先需要注册ssrc，vdn在收到该通道的数据后才能和websocket的cfd关联
			//[LIVEVDNMOONSERVER_WEBRTC_REG_SSRC][4 byte SSRC]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_WEBRTC_REG_SSRC:

				var ssrcArr = Str2Bytes(str_pad_x(8, parseInt(params.ssrc).toString(16)));

				var videoCodecArr = Str2Bytes(str_pad_x(2, parseInt(params.videoCodec).toString(16)));
				var audioCodecArr = Str2Bytes(str_pad_x(2, parseInt(params.audioCodec).toString(16)));

				msgArr = new Uint8Array(2 + 4 + 1 + 1);

				msgParams.push(agCodeArr);
				msgParams.push(ssrcArr);

				msgParams.push(videoCodecArr);
				msgParams.push(audioCodecArr);


				break;
			//用户请求获取流
			//[LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL][16 byte channelId][2 byte userIdLen][userId][2 byte starToken len][starToken]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL:

				var channelIdArr = stringToByte(params.channelId);

				msgArr = new Uint8Array(2 + 16 + (2 + callerUserIdArr.length) + (2 + starTokenArr.length));

				msgParams.push(agCodeArr);
				msgParams.push(channelIdArr);
				msgParams.push(callerUserIdLenArr);
				msgParams.push(callerUserIdArr);
				msgParams.push(starTokenLenArr);
				msgParams.push(starTokenArr);

				break;
			//停止下载流
			//[LIVEVDNMOONSERVER_STOP_DOWNLOAD]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_STOP_DOWNLOAD:
			//[LIVEVDNMOONSERVER_ALIVE]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_ALIVE:
				msgArr = new Uint8Array(2);
				msgParams.push(agCodeArr);
				break;
			//发现siv版本号不对时用户主动发送此协议请求更新streamInfo
			//[LIVEVDNMOONSERVER_QUERY_STREAM_INFO][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_QUERY_STREAM_INFO:
			//获取channel的在线人数
			//[LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER:

				var channelIdArr = stringToByte(params.channelId);

				msgArr = new Uint8Array(2 + 16);

				msgParams.push(agCodeArr);
				msgParams.push(channelIdArr);
				break;
			//收到LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_OK后，用此协议设置组播流的详细配置,默认情况下只传输admin的大图视频(admin的upId为0)
			//LIVE_STREAM_CONFIG每个byte表示某个upId需要大图还是小图,16 byte表示最多支持16人同时连麦
			//[LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY][16 byte LIVE_STREAM_CONFIG]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY:

				var streamConfig = params.streamConfig;
				var streamConfigArr = new Uint8Array(16);

				for (var i = 0; i < 16; i++) {
					if (streamConfig[i] != undefined) {
						streamConfigArr[i] = streamConfig[i];
					}
					else {
						streamConfigArr[i] = 0;
					}
				}

				msgArr = new Uint8Array(2 + 16);

				msgParams.push(agCodeArr);
				msgParams.push(streamConfigArr);
				break;


		}
		packageParamsProtocol(msgArr, start, msgParams);

		return msgArr
	}

	self.constructChatProtocol = function (code, params) {
		var msgArr;
		var start = 0;
		var msgParams = [];

		var ag_code = code;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));

		var callerUserIdArr = stringToByte(starUid);
		var callerUserIdLenArr = Str2Bytes(str_pad_4(callerUserIdArr.length.toString(16)));

		var starTokenArr = stringToByte(starToken);
		var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

		if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_CREATE_ROOM) {
			//创建聊天室
			//[CHATROOMMOONSERVER_CREATE_ROOM][2 byte userIdLen][userId][2 byte starToken len][starToken][1 byte roomType][2 byte conCurrentNum][4 byte userDefineDataLen][userDefineData]

			var roomTypeArr = params.roomType;

			var conCurrentNumArr = Str2Bytes(str_pad_4(params.conCurrentNum.toString(16)));

			var userDefineDataArr = stringToByte(params.userDefineData);
			var userDefineDataLenArr = Str2Bytes(str_pad_8(userDefineDataArr.length.toString(16)));

			msgArr = new Uint8Array(2 + (2 + callerUserIdArr.length) + (2 + starTokenArr.length) + 1 + 2 + (4 + userDefineDataArr.length));

			msgParams.push(agCodeArr);
			msgParams.push(callerUserIdLenArr);
			msgParams.push(callerUserIdArr);
			msgParams.push(starTokenLenArr);
			msgParams.push(starTokenArr);
			msgParams.push([roomTypeArr]);
			msgParams.push(conCurrentNumArr);
			msgParams.push(userDefineDataLenArr);
			msgParams.push(userDefineDataArr);

		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DELETE_ROOM) {
			msgArr = new Uint8Array(2);

			msgParams.push(agCodeArr);
			//房间创建者删除聊天室
			//[CHATROOMMOONSERVER_DELETE_ROOM]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_BAN_TO_SEND_MSG) {
			//房间创建者设置禁言(单位秒),仅CHAT_ROOM_TYPE_LOGIN模式有效
			//[CHATROOMMOONSERVER_BAN_TO_SEND_MSG][2 byte banUserIdLen][banUserId][2 byte banTime]

			var banUserIdArr = stringToByte(agentId + "_" + params.banUserId);
			var banUserIdLenArr = Str2Bytes(str_pad_4(banUserIdArr.length.toString(16)));

			var banTimeNumArr = Str2Bytes(str_pad_4(params.banTime.toString(16)));

			msgArr = new Uint8Array(2 + (2 + banUserIdArr.length) + 2);

			msgParams.push(agCodeArr);
			msgParams.push(banUserIdLenArr);
			msgParams.push(banUserIdArr);
			msgParams.push(banTimeNumArr);
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_KICKOUT_USER) {
			//房间创建者踢人, 仅CHAT_ROOM_TYPE_LOGIN模式有效，踢出后此用户无法再进入房间
			//[CHATROOMMOONSERVER_KICKOUT_USER][2 byte kickOutUserIdLen][kickOutUserId]

			var kickOutUserIdArr = stringToByte(agentId + "_" + params.kickOutUserId);
			var kickOutUserIdLenArr = Str2Bytes(str_pad_4(kickOutUserIdArr.length.toString(16)));

			msgArr = new Uint8Array(2 + (2 + kickOutUserIdArr.length));

			msgParams.push(agCodeArr);
			msgParams.push(kickOutUserIdLenArr);
			msgParams.push(kickOutUserIdArr);
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_ALIVE) {
			msgArr = new Uint8Array(2);

			msgParams.push(agCodeArr);
			//发送alive
			//[CHATROOMMOONSERVER_ALIVE]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_JOIN_ROOM) {
			//alert(starUid + ":" + starToken + ":" + callerUserIdArr.length);

			var roomIdArr = stringToByte(params.roomId);

			msgArr = new Uint8Array(2 + (2 + callerUserIdArr.length) + (2 + starTokenArr.length) + 16);
			msgParams.push(agCodeArr);
			msgParams.push(callerUserIdLenArr);
			msgParams.push(callerUserIdArr);
			msgParams.push(starTokenLenArr);
			msgParams.push(starTokenArr);
			msgParams.push(roomIdArr);
			//普通用户加入聊天室
			//[CHATROOMMOONSERVER_JOIN_ROOM][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte roomId]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM) {
			//加入公开聊天室
			//登陆用户和游客都能加入公开聊天室，但游客临时userId必须由agent自己传过来
			//[CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM][2 byte userIdLen][userId][16 byte roomId]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_LEAVE_ROOM) {
			msgArr = new Uint8Array(2);

			msgParams.push(agCodeArr);
			//普通用户离开聊天室
			//[CHATROOMMOONSERVER_LEAVE_ROOM]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SEND_MSG) {
			var msgObj = {
				"fromId": userId,
				"targetId": params.roomId,
				"time": "0",
				"msgIndex": params.msgIndex,
				"type": 1,
				"code": 0,
				"contentData": params.msg
			};
			var chatMsgArr = stringToByte(JSON.stringify(msgObj));
			var chatMsgLenArr = Str2Bytes(str_pad_8(chatMsgArr.length.toString(16)));

			msgArr = new Uint8Array(2 + (4 + chatMsgArr.length));

			msgParams.push(agCodeArr);
			msgParams.push(chatMsgLenArr);
			msgParams.push(chatMsgArr);
			//发消息
			//[CHATROOMMOONSERVER_SEND_MSG][4 byte msgLen][msg]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SEND_PRIVATE_MSG) {
			var msgObj = {
				"fromId": userId,
				"targetId": params.roomId,
				"time": "0",
				"msgIndex": params.msgIndex,
				"type": parseInt(params.type),
				"code": parseInt(params.code),
				"contentData": params.msg
			};
			var privateMsgArr = stringToByte(JSON.stringify(msgObj));
			var privateMsgLenArr = Str2Bytes(str_pad_8(privateMsgArr.length.toString(16)));

			var toUserIdArr = stringToByte(agentId + "_" + params.toUserId);
			var toUserIdLenArr = Str2Bytes(str_pad_4(toUserIdArr.length.toString(16)));

			msgArr = new Uint8Array(2 + (2 + toUserIdArr.length) + (4 + privateMsgArr.length));

			msgParams.push(agCodeArr);
			msgParams.push(toUserIdLenArr);
			msgParams.push(toUserIdArr);
			msgParams.push(privateMsgLenArr);
			msgParams.push(privateMsgArr);
			//发私信
			//[CHATROOMMOONSERVER_SEND_PRIVATE_MSG][2 byte toUserIdLen][toUserId][4 byte msgLen][msg]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM) {
			var roomIdArr = stringToByte(params.roomId);

			msgArr = new Uint8Array(2 + 16);
			msgParams.push(agCodeArr);
			msgParams.push(roomIdArr);
			//获取roomId的在线人数，此值为大概值，为当前这个服务该roomId的人数乘以moon服务总数量，如果调度是平均分配，那么相对准确
			//[CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM][16 byte roomId]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST) {

			var userIdArr = stringToByte(userId);
			var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));

			var listTypeArr = Str2Bytes(str_pad_4(params.listType.toString(16)));

			var userDefineDataArr = stringToByte(params.userDefineData);
			var userDefineDataLenArr = Str2Bytes(str_pad_8(userDefineDataArr.length.toString(16)));

			var roomIdArr = stringToByte(params.roomId);

			msgArr = new Uint8Array(2 + 2 + (2 + userIdArr.length) + 16 + (4 + userDefineDataArr.length));

			msgParams.push(agCodeArr);
			msgParams.push(listTypeArr);
			msgParams.push(userIdLenArr);
			msgParams.push(userIdArr);
			msgParams.push(roomIdArr);
			msgParams.push(userDefineDataLenArr);
			msgParams.push(userDefineDataArr);
			//保存列表信息（如聊天室列表、在线会议列表、互动直播列表）
			//[CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST][2 byte listType][2 byte userIdLen][userId][16 byte roomId][4 byte userDefineDataLen][userDefineData]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST) {

			var listTypeArr = Str2Bytes(str_pad_4(params.listType.toString(16)));

			var roomIdArr = stringToByte(params.roomId);

			msgArr = new Uint8Array(2 + 2 + (2 + callerUserIdArr.length) + 16);

			msgParams.push(agCodeArr);
			msgParams.push(listTypeArr);
			msgParams.push(callerUserIdLenArr);
			msgParams.push(callerUserIdArr);
			msgParams.push(roomIdArr);
			//删除列表信息（如聊天室列表、在线会议列表、互动直播列表）
			//[CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST][2 byte listType][2 byte userIdLen][userId][16 byte roomId]
		}
		else if (code == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST) {

			var listTypesArr = stringToByte(params.listTypes);
			var listTypesLenArr = Str2Bytes(str_pad_4(listTypesArr.length.toString(16)));

			var userIdArr = stringToByte(params.userId);
			var userIdArrLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));

			msgArr = new Uint8Array(2 + (2 + listTypesArr.length) + (2 + userIdArr.length));

			msgParams.push(agCodeArr);
			msgParams.push(listTypesLenArr);
			msgParams.push(listTypesArr);
			msgParams.push(userIdArrLenArr);
			msgParams.push(userIdArr);
			//获取全部聊天室列表
			//[CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST][2 byte listTypesLen][listTypes][2 byte userIdLen][userId]
		}

		packageParamsProtocol(msgArr, start, msgParams);
		//alert(code + ":" + msgArr.length + ":" + msgArr[0] + ":" + msgArr[1] + ":" + msgArr[msgArr.length - 2] + ":" + msgArr[msgArr.length - 1]);

		return msgArr;
	}

	//webrtc请求上传,by ly
	self.constructWebrtcUploadMsgProtocol = function (params) {
		//[LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL][2 byte userIdLen][userId][2 byte starToken len][starToken][16 byte channelId][4 byte audioSSRC][4 byte videoSmallSSRC][4 byte videoBigSSRC]
		var ag_code = AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL;
		var agCodeArr = Str2Bytes(str_pad_4(ag_code.toString(16)));
		var userIdArr = stringToByte(starUid);
		var userIdLenArr = Str2Bytes(str_pad_4(userIdArr.length.toString(16)));
		var starTokenArr = stringToByte(starToken);
		var starTokenLenArr = Str2Bytes(str_pad_4(starTokenArr.length.toString(16)));

		var channelIdArr = stringToByte(params.channelId);

		var audioSSRCArr = Str2Bytes(str_pad_x(8, parseInt(params.audioSSRC).toString(16)));
		var videoSmallSSRCArr = Str2Bytes(str_pad_x(8, parseInt(params.smallVideoSSRC).toString(16)));
		var videoBigSSRCArr = Str2Bytes(str_pad_x(8, parseInt(params.bigVideoSSRC).toString(16)));

		var videoCodecArr = Str2Bytes(str_pad_x(2, parseInt(params.videoCodec).toString(16)));
		var audioCodecArr = Str2Bytes(str_pad_x(2, parseInt(params.audioCodec).toString(16)));

		var msgArr = new Uint8Array(userIdArr.length + starTokenArr.length + 34 + 1 + 1);

		var start = 0;

		packageParamsProtocol(msgArr, start, [agCodeArr, userIdLenArr, userIdArr, starTokenLenArr, starTokenArr, channelIdArr, audioSSRCArr, videoSmallSSRCArr, videoBigSSRCArr, videoCodecArr, audioCodecArr]);

		return msgArr;
	}

	//msg内容协议:
	//[4 byte digestLength][digest][4 byte contentLength][content]
	function constructMsgDataProtocol(digest, msgTxt) {
		var digestArr = stringToByte(digest);
		var digestLenArr = Str2Bytes(str_pad_8(digestArr.length.toString(16)));
		var msgTxtArr = stringToByte(msgTxt);
		var msgTxtLenArr = Str2Bytes(str_pad_8(msgTxtArr.length.toString(16)));
		var msgProtocolArr = new Uint8Array(digestArr.length + msgTxtArr.length + 8);
		var start = 0, end = digestLenArr.length;
		for (var i = start; i < end; i++) {
			msgProtocolArr[i] = digestLenArr[i - start];
		}
		start = end;
		end = start + digestArr.length;
		for (var i = start; i < end; i++) {
			msgProtocolArr[i] = digestArr[i - start];
		}
		start = end;
		end = start + msgTxtLenArr.length;
		for (var i = start; i < end; i++) {
			msgProtocolArr[i] = msgTxtLenArr[i - start];
		}
		start = end;
		end = start + msgTxtArr.length;
		for (var i = start; i < end; i++) {
			msgProtocolArr[i] = msgTxtArr[i - start];
		}
		return msgProtocolArr;
	}

	//msg内容协议:
	//[4 byte digestLength][digest][4 byte contentLength][content]
	function parseMsgDataProtocol(data) {
		var msgArr = new Uint8Array(data);
		var startIndex = 0;
		var digestLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
		startIndex = startIndex + 4;
		var digest = byteToString(msgArr.slice(startIndex, startIndex + digestLen));
		startIndex = startIndex + digestLen;

		var contentLength = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
		startIndex = startIndex + 4;
		var content = byteToString(msgArr.slice(startIndex, startIndex + contentLength));

		var msgData = {
			"digest": digest,
			"content": content
		}
		return msgData;

	}

	//消息正文解析
	self.parseMessage = function parseMessage(data, _callback) {
		var msgArr = new Uint8Array(data);
		var agCode = parseInt("0x" + Bytes2Str(msgArr.slice(0, 2)));
		switch (agCode) {
			case AG_MSG.MSG_CLIENT_AUTH_FIN_OK:
				var msgArr = new Uint8Array(data);
				StarRtc.AUtils.msgMaxLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				console.log("登录成功，最大消息长度：", StarRtc.AUtils.msgMaxLen);
				startHeartBeat();
				_callback({ "status": "success" }, "onLoginMessage");
				break;
			case AG_MSG.MSG_CLIENT_AUTH_FIN_FAILED:
				console.log("登录失败");
				_callback({ "status": "failed" }, "onLoginMessage");
				break;
			case AG_MSG.MSG_FIN_ALIVE:
				console.log("心跳反馈");
				break;
			case AG_MSG.MSG_SERVER_MSG_RECEIVED:
				console.log("服务器收到消息");
				break;
			case AG_MSG.MSG_SERVER_TRANS_MSG_TO_FAR:
				//server trans msg to B
				//[MSG_SERVER_TRANS_MSG_TO_FAR][8 byte msgNode Add][4 byte server timestamp][1 byte msgType]{n byte msg type staff}[4 byte msgLen][msg]
				//msgType:
				//MSG_TYPE_SINGLE_CHAT			单聊消息		msg type staff: [2 byte from userIdLen][from userId][1 byte encryptType]{n byte encrypt staff}
				//MSG_TYPE_GROUP_CHAT			群消息			msg type staff: [2 byte groupIdLen][groupId][2 byte from userIdLen][from userId][1 byte encryptType]{n byte encrypt staff}
				//MSG_TYPE_PRIVATE_GROUP_CHAT	群私信消息		msg type staff: [2 byte groupIdLen][groupId][2 byte from userIdLen][from userId][1 byte encryptType]{n byte encrypt staff}
				//MSG_TYPE_GROUP_INFO_PUSH		推送群信息		msg type staff: [2 byte groupIdLen][groupId]
				//MSG_TYPE_SYSTEM_INFO_PUSH		推送系统信息	msg type staff: null
				//其中:
				//encryptType == ENCRYPT_TYPE_NONE			无加密			encrypt staff: null
				//encryptType == ENCRYPT_TYPE_AES_128_CFB	AES-128-CFB		encrypt staff: [2 byte AES key version][20 byte AES HMAC]
				console.log("收到消息");
				var ts = parseInt("0x" + Bytes2Str(msgArr.slice(10, 14)));
				var msgType = msgArr[14];
				var startIndex = 15;
				switch (msgType) {
					case MSG_TYPE.MSG_TYPE_SINGLE_CHAT:
						console.log("单聊消息");
						var fromIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 2)));
						startIndex = startIndex + 2;
						var fromId = byteToString(msgArr.slice(startIndex, startIndex + fromIdLen));
						startIndex = startIndex + fromIdLen;
						var encryptType = msgArr[startIndex];
						startIndex = startIndex + 1;
						switch (encryptType) {
							case ENCRYPT_TYPE.ENCRYPT_TYPE_NONE:
								var msgLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
								startIndex = startIndex + 4;
								var msg = parseMsgDataProtocol(msgArr.slice(startIndex, startIndex + msgLen));
								console.log(fromId, msg.digest, msg.content);

								var tmp = fromId.split("_");
								if (tmp.length == 2) {
									fromId = tmp[1];
								}
								var data = {
									"fromId": fromId,
									"digest": msg.digest,
									"msg": msg.content
								}
								_callback(data, "onSingleMessage");
								break;
							case ENCRYPT_TYPE.ENCRYPT_TYPE_AES_128_CFB:
								break;
						}
						break;
					case MSG_TYPE.MSG_TYPE_GROUP_CHAT:
						console.log("群消息");
						var groupIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 2)));
						startIndex = startIndex + 2;
						var groupId = byteToString(msgArr.slice(startIndex, startIndex + groupIdLen));
						startIndex = startIndex + groupIdLen;
						var fromIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 2)));
						startIndex = startIndex + 2;
						var fromId = byteToString(msgArr.slice(startIndex, startIndex + fromIdLen));
						startIndex = startIndex + fromIdLen;
						var encryptType = msgArr[startIndex];
						startIndex = startIndex + 1;
						switch (encryptType) {
							case ENCRYPT_TYPE.ENCRYPT_TYPE_NONE:
								var msgLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
								startIndex = startIndex + 4;
								var msg = parseMsgDataProtocol(msgArr.slice(startIndex, startIndex + msgLen));
								console.log(groupId, fromId, msg.digest, msg.content);

								var tmp = fromId.split("_");
								if (tmp.length == 2) {
									fromId = tmp[1];
								}
								var tmp2 = groupId.split("_");
								if (tmp2.length == 2) {
									groupId = tmp2[1];
								}
								var data = {
									"groupId": groupId,
									"fromId": fromId,
									"digest": msg.digest,
									"msg": msg.content
								}
								_callback(data, "onGroupMessage");
								break;
							case ENCRYPT_TYPE.ENCRYPT_TYPE_AES_128_CFB:
								break;
						}
						break;
					case MSG_TYPE.MSG_TYPE_PRIVATE_GROUP_CHAT:
						console.log("群私信消息");
						var groupIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 2)));
						startIndex = startIndex + 2;
						var groupId = byteToString(msgArr.slice(startIndex, startIndex + groupIdLen));
						startIndex = startIndex + groupIdLen;
						var fromIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 2)));
						startIndex = startIndex + 2;
						var fromId = byteToString(msgArr.slice(startIndex, startIndex + fromIdLen));
						startIndex = startIndex + fromIdLen;
						var encryptType = msgArr[startIndex];
						startIndex = startIndex + 1;
						switch (encryptType) {
							case ENCRYPT_TYPE.ENCRYPT_TYPE_NONE:
								var msgLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
								startIndex = startIndex + 4;
								var msg = parseMsgDataProtocol(msgArr.slice(startIndex, startIndex + msgLen));
								console.log(groupId, fromId, msg.digest, msg.content);
								var tmp = fromId.split("_");
								if (tmp.length == 2) {
									fromId = tmp[1];
								}
								var tmp2 = groupId.split("_");
								if (tmp2.length == 2) {
									groupId = tmp2[1];
								}
								var data = {
									"groupId": groupId,
									"fromId": fromId,
									"digest": msg.digest,
									"msg": msg.content
								}
								_callback(data, "onGroupPrivateMessage");
								break;
							case ENCRYPT_TYPE.ENCRYPT_TYPE_AES_128_CFB:
								break;
						}
						break;
					case MSG_TYPE.MSG_TYPE_GROUP_INFO_PUSH:
						console.log("推送群信息");
						var groupIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 2)));
						startIndex = startIndex + 2;
						var groupId = byteToString(msgArr.slice(startIndex, startIndex + groupIdLen));
						startIndex = startIndex + groupIdLen;
						var msgLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
						startIndex = startIndex + 4;
						var msg = parseMsgDataProtocol(msgArr.slice(startIndex, startIndex + msgLen));
						console.log(groupId, msg.digest, msg.content);
						var tmp2 = groupId.split("_");
						if (tmp2.length == 2) {
							groupId = tmp2[1];
						}
						var data = {
							"groupId": groupId,
							"digest": msg.digest,
							"msg": msg.content
						}
						_callback(data, "onGroupPushMessage");
						break;
					case MSG_TYPE.MSG_TYPE_SYSTEM_INFO_PUSH:
						console.log("推送系统信息");
						var msgLen = parseInt("0x" + Bytes2Str(msgArr.slice(startIndex, startIndex + 4)));
						startIndex = startIndex + 4;
						var msg = parseMsgDataProtocol(msgArr.slice(startIndex, startIndex + msgLen));
						console.log(msg.digest, msg.content);
						var data = {
							"digest": msg.digest,
							"msg": msg.content
						}
						_callback(data, "onSystemPushMessage");
						break;
				}


				sendMsgReceived(msgArr.slice(2, 10));
				break;
			case AG_MSG.MSG_ERR:
				//[MSG_ERR][2 byte errId][2 byte errStringLen][errString]
				var errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var errStr = byteToString(msgArr.slice(6, msgArr.byteLength));
				console.log("报错:", errId, errStr);
				var data = {
					"errId": errId,
					"errStr": errStr
				}
				_callback(data, "onErrorMessage");
				break;

			case AG_MSG.MSG_CLIENT_GROUP_GET_GROUP_LIST_FIN:
				//[MSG_CLIENT_GROUP_GET_GROUP_LIST_FIN][2 byte statusLen][status][4 byte reqIndex][4 byte groupIdListLen][groupIdList][4 byte groupNameListLen][groupNameList][4 byte creatorListLen][creatorListLen]

				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var status = byteToString(msgArr.slice(4, 4 + statusLen));

				var reqIndex = parseInt("0x" + Bytes2Str(msgArr.slice(4 + statusLen, 4 + statusLen + 4)));

				var groupIdListLen = parseInt("0x" + Bytes2Str(msgArr.slice(4 + statusLen + 4, 4 + statusLen + 4 + 4)));
				var groupIdList = byteToString(msgArr.slice(4 + statusLen + 4 + 4, 4 + statusLen + 4 + 4 + groupIdListLen)).split(",");
				if (groupIdListLen == 0) {
					groupIdList = [];
				}

				var groupNameListLen = parseInt("0x" + Bytes2Str(msgArr.slice(4 + statusLen + 4 + 4 + groupIdListLen, 4 + statusLen + 4 + 4 + groupIdListLen + 4)));
				var groupNameList = byteToString(msgArr.slice(4 + statusLen + 4 + 4 + groupIdListLen + 4, 4 + statusLen + 4 + 4 + groupIdListLen + 4 + groupNameListLen)).split(",");

				var creatorListLen = parseInt("0x" + Bytes2Str(msgArr.slice(4 + statusLen + 4 + 4 + groupIdListLen + 4 + groupNameListLen, 4 + statusLen + 4 + 4 + groupIdListLen + 4 + groupNameListLen + 4)));
				var creatorList = byteToString(msgArr.slice(4 + statusLen + 4 + 4 + groupIdListLen + 4 + groupNameListLen + 4, 4 + statusLen + 4 + 4 + groupIdListLen + 4 + groupNameListLen + 4 + creatorListLen)).split(",");

				var groupsInfo = [];

				for (var i = 0; i < groupIdList.length; i++) {
					var group = { "groupId": groupIdList[i], "groupName": groupNameList[i], "creator": creatorList[i] };
					groupsInfo.push(group);
				}
				_callback({ "status": "success", "statusStr": status, "reqIndex": reqIndex, "groupsInfo": groupsInfo }, "onGetGroupList");
				break;

			case AG_MSG.MSG_CLIENT_GROUP_GET_USER_LIST_FIN:
				//[MSG_CLIENT_GROUP_GET_USER_LIST_FIN][2 byte statusLen][status][4 byte reqIndex][4 byte userIdListLen][userIdList]
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var status = byteToString(msgArr.slice(4, 4 + statusLen));

				var reqIndex = parseInt("0x" + Bytes2Str(msgArr.slice(4 + statusLen, 4 + statusLen + 4)));

				var userIdListLen = parseInt("0x" + Bytes2Str(msgArr.slice(4 + statusLen + 4, 4 + statusLen + 4 + 4)));
				var userIdList = byteToString(msgArr.slice(4 + statusLen + 4 + 4, 4 + statusLen + 4 + 4 + userIdListLen)).split(",");
				_callback({ "status": "success", "statusStr": status, "reqIndex": reqIndex, "userIdList": userIdList }, "onGetGroupUserList");
				break;


			case AG_MSG.MSG_CLIENT_GET_ALIVE_NUMBER_FIN:
				//[MSG_CLIENT_GET_ALIVE_NUMBER_FIN][4 byte count][2 byte totalPageNum]
				var count = parseInt("0x" + Bytes2Str(msgArr.slice(2, 6)));
				var totalPageNum = parseInt("0x" + Bytes2Str(msgArr.slice(6, 8)));
				_callback({ "status": "success", "count": count, "totalPageNum": totalPageNum }, "onGetOnlineNumber");
				break;

			//[MSG_CLIENT_GET_ALL_USER_LIST_OK][2 byte totalPageNum][2 byte reqPageNum][4 byte userIdListLen][userIdList]
			case AG_MSG.MSG_CLIENT_GET_ALL_USER_LIST_OK:

				var totalPageNum = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var reqPageNum = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));

				var userIdListLen = parseInt("0x" + Bytes2Str(msgArr.slice(6, 6 + 4)));
				var userIdList = byteToString(msgArr.slice(6 + 4, 6 + 4 + userIdListLen)).split(",");
				_callback({ "status": "success", "totalPageNum": totalPageNum, "reqPageNum": reqPageNum, "userIdList": userIdList }, "onGetAllUserList");
				break;

			//[MSG_CLIENT_GET_ALL_USER_LIST_FAILED][2 byte totalPageNum][2 byte reqPageNum]
			case AG_MSG.MSG_CLIENT_GET_ALL_USER_LIST_FAILED:
				var totalPageNum = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var reqPageNum = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				_callback({ "status": "failed", "totalPageNum": totalPageNum, "reqPageNum": reqPageNum }, "onGetAllUserList");
				break;

		}
	}

	//src协议解析
	self.parseSrcMoonServerMessage = function (data, _callback) {
		var msgArr = new Uint8Array(data);
		var agCode = parseInt("0x" + Bytes2Str(msgArr.slice(0, 2)));
		switch (agCode) {
			//ly add
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_WEBRTC_APPLY_UPLOAD_CHANNEL_OK:
				var tmp = msgArr.slice(18, 20);
				var tmp2 = Bytes2Str(tmp);
				var fingerprintLen = parseInt("0x" + Bytes2Str(msgArr.slice(18, 20)));
				var fingerprint = byteToString(msgArr.slice(20, 20 + fingerprintLen));
				_callback({ "type": "srcApplyUpload", "status": "success", "fingerprint": fingerprint });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_APPLY_UPLOAD_CHANNEL_FAILED:
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var msg = byteToString(msgArr.slice(4, 4 + statusLen));

				_callback({ "type": "srcApplyUpload", "status": "failed", "msg": msg });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_ALIVE_FIN:
				console.log("webrtc心跳反馈");
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_NOTIFY_UPER_STREAM_INFO_UPDATE:
				var siv = parseInt("0x" + Bytes2Str(msgArr.slice(2, 3)));
				var start = 3;
				var end = msgArr.length;
				var uperInfos = {
					"siv": siv,
					"uperInfos": {}
				};
				for (; start < end;) {
					var upId = parseInt("0x" + Bytes2Str(msgArr.slice(start, start + 1)));
					start += 1;
					var userIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(start, start + 2)));
					start += 2;
					var userId = byteToString(msgArr.slice(start, start + userIdLen));
					start += userIdLen;

					uperInfos.uperInfos[upId] = {
						"upId": upId,
						"userId": userId
					};
				}
				_callback({ "type": "uperStreamInfoUpdate", "status": "success", "msg": uperInfos });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_STOP_STREAM:
				_callback({ "type": "stopStream", "status": "success" });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY_OK:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "streamConfig", "status": "success", "channelId": channelId });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY_FAILED:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "streamConfig", "status": "failed", "channelId": channelId });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_DELETE_CHANNEL_OK:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "delChannel", "status": "success", "channelId": channelId });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_DELETE_CHANNEL_FAILED:
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var msg = byteToString(msgArr.slice(4, 4 + statusLen));
				var channelId = byteToString(msgArr.slice(4 + statusLen, 4 + statusLen + 16));
				_callback({ "type": "delChannel", "status": "failed", "channelId": channelId, "msg": msg });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_OK:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "createChannel", "status": "success", "channelId": channelId });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_FAILED:
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var msg = byteToString(msgArr.slice(4, 4 + statusLen));
				_callback({ "type": "createChannel", "status": "failed", "msg": msg });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_SEND_PEER_STREAM:
				var upId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 3)));
				var siv = parseInt("0x" + Bytes2Str(msgArr.slice(3, 4)));
				var streamData = byteToString(msgArr.slice(5));
				var streamDataType = parseInt("0x" + Bytes2Str(msgArr.slice(4, 5)));
				_callback({ "type": "streamData", "status": "success", "upId": upId, "siv": siv, "streamDataType": streamDataType, "streamData": streamData });
				break;
			case AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_ERR:
				var msg = {};
				msg.errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				msg.errStrlen = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				msg.errStr = byteToString(msgArr.slice(6, 6 + msg.errStrlen));
				_callback({ "type": "serverErr", "status": "failed", "msg": msg });
				break;
			//ly add end
		}
	}

	//vdn协议解析
	self.parseVdnMoonServerMessage = function (data, _callback) {
		var msgArr = new Uint8Array(data);
		var agCode = parseInt("0x" + Bytes2Str(msgArr.slice(0, 2)));
		switch (agCode) {
			//webrtc注册ssrc成功
			//[LIVEVDNMOONSERVER_WEBRTC_REG_SSRC_OK][2 byte fingerprintLen][fingerprint]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_WEBRTC_REG_SSRC_OK:
				var fingerprintLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var fingerprint = byteToString(msgArr.slice(4, 4 + fingerprintLen));
				_callback({ "type": "vdnWebrtcReg", "status": "success", "fingerprint": fingerprint });
				break;

			//告诉用户申请流成功
			//[LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_OK][16 byte channelId][1 byte siv][1 byte upid][2 byte upUserIdLen][upUserId]
			//																		......
			//																		[1 byte upid][2 byte upUserIdLen][upUserId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_OK:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				var siv = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 1)));
				var start = 2 + 16 + 1;
				var end = msgArr.length;
				var uperInfos = {
					"siv": siv,
					"uperInfos": {}
				};
				for (; start < end;) {
					var upId = parseInt("0x" + Bytes2Str(msgArr.slice(start, start + 1)));
					start += 1;
					var userIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(start, start + 2)));
					start += 2;
					var userId = byteToString(msgArr.slice(start, start + userIdLen));
					start += userIdLen;

					uperInfos.uperInfos[upId] = {
						"upId": upId,
						"userId": userId
					};
				}
				_callback({ "type": "vdnApplyDownload", "status": "success", "channelId": channelId, "uperInfos": uperInfos });
				break;

			//[LIVEVDNMOONSERVER_ALIVE_FIN]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_ALIVE_FIN:
				console.log("vdn 心跳反馈");
				break;

			//告诉用户申请流失败
			//state见APPLY_DOWNLOAD_CHANNEL状态
			//[LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_FAILED][2 byte statusLen][status][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL_FAILED:
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var status = byteToString(msgArr.slice(4, 4 + statusLen));
				var channelId = byteToString(msgArr.slice(4 + statusLen, 4 + statusLen + 16));
				_callback({ "type": "vdnApplyDownload", "status": "failed", "channelId": channelId, "failedStatus": status });
				break;

			//组播流的详细配置请求成功
			//[LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_OK][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_OK:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "streamConfig", "status": "success", "channelId": channelId });
				break;

			//[LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_FAILED][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY_FAILED:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "streamConfig", "status": "failed", "channelId": channelId });
				break;

			//当streamInfo信息变更时通知所有下载此channel的用户更新streamInfo
			//[LIVEVDNMOONSERVER_NOTIFY_VIEWER_STREAM_INFO_UPDATE][16 byte channelId][1 byte siv][1 byte upid][2 byte upUserIdLen][upUserId]
			//																					 ......
			//																					 [1 byte upid][2 byte upUserIdLen][upUserId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_NOTIFY_VIEWER_STREAM_INFO_UPDATE:
				var channelId = byteToString(msgArr.slice(2, 2 + 16));
				var siv = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 1)));
				var start = 2 + 16 + 1;
				var end = msgArr.length;
				var uperInfos = {
					"channelId": channelId,
					"siv": siv,
					"uperInfos": {}
				};
				for (; start < end;) {
					var upId = parseInt("0x" + Bytes2Str(msgArr.slice(start, start + 1)));
					start += 1;
					var userIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(start, start + 2)));
					start += 2;
					var userId = byteToString(msgArr.slice(start, start + userIdLen));
					start += userIdLen;

					uperInfos.uperInfos[upId] = {
						"upId": upId,
						"userId": userId
					};
				}
				_callback({ "type": "uperStreamInfoUpdate", "status": "success", "channelId": channelId, "msg": uperInfos });
				break;

			//向用户发送流内容
			//[LIVEVDNMOONSERVER_SEND_STREAM][1 byte upId][1 byte siv][1 byte streamDataType][streamData]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_SEND_STREAM:
				var upId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 3)));
				var siv = parseInt("0x" + Bytes2Str(msgArr.slice(3, 4)));
				var streamDataType = parseInt("0x" + Bytes2Str(msgArr.slice(4, 5)));
				var streamData = byteToString(msgArr.slice(5));
				_callback({ "type": "streamData", "status": "success", "upId": upId, "siv": siv, "streamDataType": streamDataType, "streamData": streamData });
				break;

			//告诉用户此channel已经关闭
			//[LIVEVDNMOONSERVER_CHANNEL_CLOSE][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_CHANNEL_CLOSE:
				break;

			//告诉用户此channel已经若干秒未收到数据，显示主播暂时离开或网络连接中
			//[LIVEVDNMOONSERVER_CHANNEL_LEAVE][16 byte channelId]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_CHANNEL_LEAVE:
				break;

			//[LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER_FIN][16 byte channelId][4 byte totalOnlineNumber]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_QUERY_CHANNEL_ONLINE_NUMBER_FIN:
				break;

			//[LIVEVDNMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
			case AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_ERR:
				var msg = {};
				msg.errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				msg.errStrlen = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				msg.errStr = byteToString(msgArr.slice(6, 6 + msg.errStrlen));
				_callback({ "type": "serverErr", "status": "failed", "msg": msg });
				break;
		}
	}

	self.parseChatMoonServerMessage = function (data, _callback) {
		var msgArr = new Uint8Array(data);
		var agCode = parseInt("0x" + Bytes2Str(msgArr.slice(0, 2)));
		switch (agCode) {
			//告诉用户申请流成功
			//[CHATROOMMOONSERVER_CREATE_ROOM_OK][16 byte roomId][2 byte maxContentLen]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_CREATE_ROOM_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				var maxContentLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 2)));
				_callback({ "type": "createChatRoom", "status": "success", "chatroomId": roomId, "maxContentLen": maxContentLen });
				break;

			//[CHATROOMMOONSERVER_CREATE_ROOM_FAILED][2 byte statusLen][status]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_CREATE_ROOM_FAILED:
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				var status = byteToString(msgArr.slice(2 + 2, 2 + 2 + statusLen));
				_callback({ "type": "createChatRoom", "status": "failed", "status": status });
				break;

			//[CHATROOMMOONSERVER_DELETE_ROOM_OK][16 byte roomId]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DELETE_ROOM_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "deleteChatRoom", "status": "success", "roomId": roomId });
				break;

			//[CHATROOMMOONSERVER_DELETE_ROOM_FAILED][16 byte roomId][2 byte statusLen][status]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DELETE_ROOM_FAILED:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 2)));
				var status = byteToString(msgArr.slice(2 + 16 + 2, 2 + 16 + 2 + statusLen));
				_callback({ "type": "deleteChatRoom", "status": "failed", "msg": status, "roomId": roomId });
				break;

			//[CHATROOMMOONSERVER_BAN_TO_SEND_MSG_OK][2 byte banUserIdLen][banUserId][2 byte banTime]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_BAN_TO_SEND_MSG_OK:
				var banUserIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				var banUserId = byteToString(msgArr.slice(2 + 2, 2 + 2 + banUserIdLen));
				var banTime = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 2 + banUserIdLen, 2 + 2 + banUserIdLen + 2)));
				_callback({ "type": "banaedToSendMsg", "status": "success", "banUserId": banUserId, "banTime": banTime });
				break;

			//[CHATROOMMOONSERVER_BAN_TO_SEND_MSG_FAILED][2 byte banUserIdLen][banUserId][2 byte banTime][2 byte statusLen][status]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_BAN_TO_SEND_MSG_FAILED:
				var banUserIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				var banUserId = byteToString(msgArr.slice(2 + 2, 2 + 2 + banUserIdLen));
				var banTime = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 2 + banUserIdLen, 2 + 2 + banUserIdLen + 2)));
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 2 + banUserIdLen + 2, 2 + 2 + banUserIdLen + 2 + 2)));
				var status = byteToString(msgArr.slice(2 + 2 + banUserIdLen + 2 + 2, 2 + 2 + banUserIdLen + 2 + 2 + statusLen));
				_callback({ "type": "banaedToSendMsg", "status": "failed", "banUserId": banUserId, "banTime": banTime, "msg": status });
				break;

			//[CHATROOMMOONSERVER_KICKOUT_USER_OK][2 byte kickOutUserIdLen][kickOutUserId]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_KICKOUT_USER_OK:
				var kickOutUserIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				var kickOutUserId = byteToString(msgArr.slice(2 + 2, 2 + 2 + kickOutUserIdLen));
				_callback({ "type": "kickOutUser", "status": "success", "kickOutUserId": kickOutUserId });
				break;

			//[CHATROOMMOONSERVER_KICKOUT_USER_FAILED][2 byte kickOutUserIdLen][kickOutUserId][2 byte statusLen][status]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_KICKOUT_USER_FAILED:
				var kickOutUserIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				var kickOutUserId = byteToString(msgArr.slice(2 + 2, 2 + 2 + kickOutUserIdLen));
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 2 + kickOutUserIdLen, 2 + 2 + banUserIdLen + 2)));
				var status = byteToString(msgArr.slice(2 + 2 + kickOutUserIdLen + 2, 2 + 2 + kickOutUserIdLen + 2 + statusLen));
				_callback({ "type": "kickOutUser", "status": "failed", "kickOutUserId": kickOutUserId, "msg": status });
				break;

			//[CHATROOMMOONSERVER_JOIN_ROOM_OK][16 byte roomId][2 byte maxContentLen]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_JOIN_ROOM_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				var maxContentLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 2)));
				_callback({ "type": "joinChatRoom", "status": "success", "roomId": roomId, "maxContentLen": maxContentLen });
				break;

			//[CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM_OK][16 byte roomId][2 byte maxContentLen]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_JOIN_PUBLIC_ROOM_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				var maxContentLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 2)));
				_callback({ "type": "joinChatRoom", "status": "success", "roomId": roomId, "maxContentLen": maxContentLen });
				break;

			//[CHATROOMMOONSERVER_JOIN_ROOM_FAILED][16 byte roomId][2 byte statusLen][status]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_JOIN_ROOM_FAILED:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				var statusLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 2)));
				var status = byteToString(msgArr.slice(2 + 16 + 2, 2 + 16 + 2 + statusLen));
				_callback({ "type": "joinChatRoom", "status": "failed", "failedStatus": status, "roomId": roomId });
				break;

			//[CHATROOMMOONSERVER_ALIVE_FIN]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_ALIVE_FIN:
				console.log("chatRoom心跳反馈");
				break;

			//[CHATROOMMOONSERVER_TRANS_PRIVATE_MSG_TO_FAR][2 byte fromUserIdLen][fromUserId][4 byte msgLen][msg]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_TRANS_PRIVATE_MSG_TO_FAR:

			//[CHATROOMMOONSERVER_TRANS_MSG_TO_FAR][2 byte fromUserIdLen][fromUserId][4 byte msgLen][msg]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_TRANS_MSG_TO_FAR:
				var fromUserIdLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				var fromUserId = byteToString(msgArr.slice(2 + 2, 2 + 2 + fromUserIdLen));
				var msgLen = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 2 + fromUserIdLen, 2 + 2 + fromUserIdLen + 4)));

				var msg = byteToString(msgArr.slice(2 + 2 + fromUserIdLen + 4, 2 + 2 + fromUserIdLen + 4 + msgLen));

				var type = (agCode == AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_TRANS_PRIVATE_MSG_TO_FAR ? "recvChatPrivateMsg" : "recvChatMsg");
				_callback({ "type": type, "status": "success", "fromUserId": fromUserId, "msg": msg });
				break;

			//用户被禁言或发送太频繁被系统禁言
			//[CHATROOMMOONSERVER_BANNED_SEND_MSG][2 byte banTime]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_BANNED_SEND_MSG:
				var banTime = parseInt("0x" + Bytes2Str(msgArr.slice(2, 2 + 2)));
				_callback({ "type": "chatroomUserBannedMsg", "status": "success", "banTime": banTime });
				break;
			//用户被踢出聊天室
			//[CHATROOMMOONSERVER_KICKED]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_KICKED:
				_callback({ "type": "chatroomUserKicked", "status": "success" });
				break;

			//发消息余额不足
			//[CHATROOMMOONSERVER_SEND_MSG_NO_FEE]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SEND_MSG_NO_FEE:
				_callback({ "type": "sendMsgNoFree" });
				break;

			//错误
			//[CHATROOMMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_ERR:
				var msg = {};
				msg.errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				msg.errStrlen = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				msg.errStr = byteToString(msgArr.slice(6, 6 + msg.errStrlen));
				_callback({ "type": "serverErr", "status": "failed", "msg": msg });
				break;

			//[CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM_OK][16 byte roomId][4 byte onlineNum]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				var onlineNum = parseInt("0x" + Bytes2Str(msgArr.slice(2 + 16, 2 + 16 + 4)));
				_callback({ "type": "getRoomOnlineNum", "status": "success", "roomId": roomId, "onlineNum": onlineNum });
				break;
			//[CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_OK][16 byte roomId]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "saveToChatroomList", "status": "success", "roomId": roomId });
				break;
			//[CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_FAILED][16 byte roomId]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST_FAILED:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "saveToChatroomList", "status": "failed", "roomId": roomId });
				break;
			//[CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_OK][16 byte roomId]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_OK:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "delFromToChatroomList", "status": "success", "roomId": roomId });
				break;
			//[CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_FAILED][16 byte roomId]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST_FAILED:
				var roomId = byteToString(msgArr.slice(2, 2 + 16));
				_callback({ "type": "delFromToChatroomList", "status": "failed", "roomId": roomId });
				break;
			//[CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST_FIN][4 byte listLen][list data]
			case AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST_FIN:

				var listLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 6)));
				var listData = byteToString(msgArr.slice(6, 6 + listLen));

				_callback({ "type": "queryAllChatroomList", "status": "success", "listData": listData });
				break;
		}
	}

	self.parseVoipMoonServerMessage = function (data, _callback) {
		var msgArr = new Uint8Array(data);
		var agCode = parseInt("0x" + Bytes2Str(msgArr.slice(0, 2)));
		switch (agCode) {
			//[VOIPMOONSERVER_CALLING_ACK]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_CALLING_ACK:
				_callback({ "type": "voipCallingAck", "status": "success" });
				break;

			//[VOIPMOONSERVER_CALLING_WEBRTC_OK][2 byte fingerprintLen][fingerprint]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_CALLING_WEBRTC_OK:
				var fingerprintLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var fingerprint = byteToString(msgArr.slice(4, 4 + fingerprintLen));
				_callback({ "type": "voipCalling", "status": "success", "fingerprint": fingerprint });
				break;

			//[VOIPMOONSERVER_CALLING_FAILED][2 byte errId][2 byte errStringLen][errString]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_CALLING_FAILED:
				var msg = {};
				msg.errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				msg.errStrlen = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				msg.errStr = byteToString(msgArr.slice(6, 6 + msg.errStrlen));
				_callback({ "type": "voipCalling", "status": "failed", "msg": msg });
				break;

			//[VOIPMOONSERVER_RESPONSEING_WEBRTC_OK][2 byte fingerprintLen][fingerprint]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_RESPONSEING_WEBRTC_OK:
				var fingerprintLen = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				var fingerprint = byteToString(msgArr.slice(4, 4 + fingerprintLen));
				_callback({ "type": "voipResponseing", "status": "success", "fingerprint": fingerprint });
				break;

			//[VOIPMOONSERVER_RESPONSEING_FAILED][2 byte errId][2 byte errStringLen][errString]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_RESPONSEING_FAILED:
				var msg = {};
				msg.errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				msg.errStrlen = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				msg.errStr = byteToString(msgArr.slice(6, 6 + msg.errStrlen));
				_callback({ "type": "voipResponseing", "status": "failed", "msg": msg });
				break;

			//[VOIPMOONSERVER_DOWNLOADING][1 byte streamDataType][streamData]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_DOWNLOADING:
				break;

			//[VOIPMOONSERVER_SUGGEST_BITRATE][2 byte suggestFramerate][2 byte suggestBitrate]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_SUGGEST_BITRATE:
				break;

			//错误
			//[VOIPMOONSERVER_ERR][2 byte errId][2 byte errStringLen][errString]
			case AG_VOIPMOONSERVER.VOIPMOONSERVER_ERR:
				var msg = {};
				msg.errId = parseInt("0x" + Bytes2Str(msgArr.slice(2, 4)));
				msg.errStrlen = parseInt("0x" + Bytes2Str(msgArr.slice(4, 6)));
				msg.errStr = byteToString(msgArr.slice(6, 6 + msg.errStrlen));
				_callback({ "type": "serverErr", "status": "failed", "msg": msg });
				break;
		}
	}

	//-----------------------------------第二层协议 end----------------------------------------------

	//发送消息回执
	function sendMsgReceived(data) {
		console.log("发送消息回执");
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructReceivedMsg(data)
			)
		);
	}

	//心跳正文组装
	self.constructHeartBeatMsg = function (code) {
		var ag_code = code;
		var agCodeArr = new Uint8Array(Str2Bytes(str_pad_4(ag_code.toString(16))));
		return agCodeArr;
	}

	//发送心跳
	var heartbeat_timer;
	function startHeartBeat() {
		// console.log("发送心跳");
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				self.constructHeartBeatMsg(AG_MSG.MSG_ALIVE_CLIENT)
			)
		);
		heartbeat_timer = setInterval(function () {
			// console.log("发送心跳");
			StarRtc.StarManager.send(
				StarRtc.AUtils.packageProtocol(
					APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
					ACTION_GROUP_ID.ACTIONGROUP_MSG,
					self.constructHeartBeatMsg(AG_MSG.MSG_ALIVE_CLIENT)
				)
			);
		}, 15000);
	}

	//停止心跳
	function stopHeartBeat() {
		clearInterval(heartbeat_timer);
	}

	//长度补全到用4个byte表示
	function str_pad_8(hex) {
		var zero = '00000000';
		var tmp = 8 - hex.length;
		var len = zero.substr(0, tmp) + hex;
		return len;
	}

	//长度补全到用2个byte表示
	function str_pad_4(hex) {
		var zero = '0000';
		var tmp = 4 - hex.length;
		var len = zero.substr(0, tmp) + hex;
		return len;
	}

	//长度补全到用x个byte表示
	function str_pad_x(x, hex) {
		var zero = new Array(x + 1).join("0");
		var tmp = x - hex.length;
		var len = zero.substr(0, tmp) + hex;
		return len;
	}

	//正文转换用 string to byte[]
	function stringToByte(str) {
		var bytes = new Array();
		var len, c;
		len = str.length;
		for (var i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if (c >= 0x010000 && c <= 0x10FFFF) {
				bytes.push(((c >> 18) & 0x07) | 0xF0);
				bytes.push(((c >> 12) & 0x3F) | 0x80);
				bytes.push(((c >> 6) & 0x3F) | 0x80);
				bytes.push((c & 0x3F) | 0x80);
			} else if (c >= 0x000800 && c <= 0x00FFFF) {
				bytes.push(((c >> 12) & 0x0F) | 0xE0);
				bytes.push(((c >> 6) & 0x3F) | 0x80);
				bytes.push((c & 0x3F) | 0x80);
			} else if (c >= 0x000080 && c <= 0x0007FF) {
				bytes.push(((c >> 6) & 0x1F) | 0xC0);
				bytes.push((c & 0x3F) | 0x80);
			} else {
				bytes.push(c & 0xFF);
			}
		}
		return bytes;
	}

	//正文转换用 byte[] to string
	function byteToString(arr) {
		if (typeof arr === 'string') {
			return arr;
		}
		var str = '',
			_arr = arr;
		for (var i = 0; i < _arr.length; i++) {
			var one = _arr[i].toString(2),
				v = one.match(/^1+?(?=0)/);
			if (v && one.length == 8) {
				var bytesLength = v[0].length;
				var store = _arr[i].toString(2).slice(7 - bytesLength);
				for (var st = 1; st < bytesLength; st++) {
					store += _arr[st + i].toString(2).slice(2);
				}
				str += String.fromCharCode(parseInt(store, 2));
				i += bytesLength - 1;
			} else {
				str += String.fromCharCode(_arr[i]);
			}
		}
		return str;
	}

	//数字 十六进制字符串转字节数组
	function Str2Bytes(str) {
		var pos = 0;
		var len = str.length;
		if (len % 2 != 0) {
			return null;
		}
		len /= 2;
		var hexA = new Array();
		for (var i = 0; i < len; i++) {
			var s = str.substr(pos, 2);
			var v = parseInt("0x" + s);
			hexA.push(v);
			pos += 2;
		}
		return hexA;
	}

	//数字 字节数组转十六进制字符串
	function Bytes2Str(arr) {
		var str = "";
		for (var i = 0; i < arr.length; i++) {
			var tmp = arr[i].toString(16);
			if (tmp.length == 1) {
				tmp = "0" + tmp;
			}
			str += tmp;
		}
		return str;
	}

	function packageParamsProtocol(data, fromId, params) {
		var startIdx = fromId;
		for (var i in params) {
			var _para = params[i];
			for (var j = 0; j < _para.length; j++ , startIdx++) {
				data[startIdx] = _para[j];
			}
		}
	}

};

StarRtc.StarManager = new function () {
	var self = this;
	var version = 'starRTC v1.0.0';
	var agentId = "";
	var userId = "";
	var starUid = "";
	var authKey = "";
	var starToken = "";
	var websocket = null;
	var connectCallback = null;

	//用户验证，获取starToken
	var msgServerUrl = "";

	//输出版本号
	self.version = function () {
		console.log(version);
		return version;
	};

	//设置webSocket链接
	self.login = function (_agentId, _userId, _authKey, _callback) {
		if ('WebSocket' in window) {
			agentId = _agentId;
			userId = _userId;
			starUid = _agentId + "_" + _userId;
			authKey = _authKey;
			connectCallback = _callback;
			//登录验证
			if (StarRtc.Instance.configModePulic) {
				$.get("https://" + StarRtc.Instance.loginServerUrl + ":" + StarRtc.Instance.loginServerPort + "/?userId=" + starUid + "&authKey=" + authKey, function (data, status) {
					console.log("authKey 验证：", status, data);
					if (status === "success") {
						var obj = JSON.parse(data);
						if (obj.status == 1) {
							starToken = obj.data;
							//获取消息服务器地址
							$.get("https://" + StarRtc.Instance.msgScheduleUrl + ":" + StarRtc.Instance.msgSchedulePort + "/?userId=" + starUid, function (data, status) {
								var status = "success";
								console.log("消息调度：", status, data);
								if (status === "success") {
									var obj = JSON.parse(data);
									if (obj.status == 1) {
										msgServerUrl = "wss://" + obj.data;
										self.connect();
									}
									else {
										_callback({ "msg": "请求msg调度数据异常" }, "connect failed");
									}
								}
								else {
									_callback({ "msg": "请求msg调度地址失败" }, "connect failed");
								}
							});
						}
						else {
							_callback({ "msg": "登录验证失败" }, "connect failed");
						}
					}
					else {
						_callback({ "msg": "请求验证地址失败" }, "connect failed");
					}
				});
			}
			else {
				starToken = "free";
				msgServerUrl = "wss://" + StarRtc.Instance.msgServerUrl + ":" + StarRtc.Instance.msgServerWebsocketPort;
				self.connect();
			}

		}
		else {
			console.log('当前浏览器 Not support websocket');
			_callback({ "msg": "当前浏览器 Not support websocket" }, "connect failed");
		}
	};

	self.connect = function () {
		console.log('WebSocket：' + msgServerUrl);
		websocket = new WebSocket(msgServerUrl);

		//连接发生错误的回调方法
		websocket.onerror = function () {
			console.log("WebSocket连接发生错误");
			connectCallback({ "msg": "WebSocket连接发生错误" }, "connect failed");
		};

		//连接成功建立的回调方法
		websocket.onopen = function () {
			console.log("WebSocket连接成功");
			connectCallback({ "msg": "WebSocket连接成功" }, "connect success");
			self.startAuth();
		};

		//接收到消息的回调方法
		websocket.onmessage = function (event) {
			console.log("onmessage", event.data);
			connectCallback(event.data, "onmessage");
		};

		//连接关闭的回调方法
		websocket.onclose = function () {
			console.log("WebSocket连接关闭");
			connectCallback({ "msg": "WebSocket连接关闭" }, "connect closed");
			websocket = null;
			//self.close();
		};
	}

	//关闭WebSocket连接
	self.close = function () {
		console.log("关闭WebSocket连接");
		StarRtc.AUtils.clear();
		if (websocket != null) {
			websocket.close();
		}
	};

	//发送消息
	self.send = function (_topMsg) {
		if (websocket != null) {
			websocket.send(_topMsg);
		}
	};

	//开始登录鉴权
	self.startAuth = function () {
		StarRtc.AUtils.setUserInfo(agentId, userId, starToken);
		self.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructAuthMsg()
			)
		);
	}

	//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
	window.onbeforeunload = function () {
		self.close();
	};
};

StarRtc.Instance = new function () {
	var self = this;
	var agentId = "";
	var userId = "";
	var starUid = "";
	var authKey = "";
	var userCallback = null;

	//ly
	var extraIMCallback = null;
	var _msgIndex = 0;

	self.configModePulic = true;

	self.loginServerUrl = "ips2.starrtc.com";
	self.loginServerPort = "9920";
	self.msgScheduleUrl = "ips2.starrtc.com";
	self.msgSchedulePort = "9904";
	self.chatRoomScheduleUrl = "ips2.starrtc.com";
	self.chatRoomSchedulePort = "9907";
	self.srcScheduleUrl = "ips2.starrtc.com";
	self.srcSchedulePort = "9929";
	self.vdnScheduleUrl = "ips2.starrtc.com";
	self.vdnSchedulePort = "9926";
	self.voipServerUrl = "voip2.starrtc.com";
	self.voipServerPort = "10086";
	self.voipServerWebsocketPort = "10087";
	self.voipServerWebrtcPort = "10088";
	self.workServerUrl = "https://api.starrtc.com/public";
	self.webrtcServerIP = "123.103.93.74";

	self.msgServerUrl = "ips2.starrtc.com",
		self.msgServerWebsocketPort = "9904"
	self.chatRoomServerUrl = "ips2.starrtc.com";
	self.chatRoomServerWebsocketPort = "9907"
	self.srcServerUrl = "ips2.starrtc.com";
	self.srcServerWebsocketPort = "9929";
	self.srcServerWebrtcPort = "10088";
	self.vdnServerUrl = "ips2.starrtc.com";
	self.vdnServerWebsocketPort = "9929";
	self.vdnServerWebrtcPort = "10088";

	self.version = function () {
		return StarRtc.StarManager.version();
	}

	//拦截底层回调 处理后再向上回调用户callback
	var msgInnerCallback = function (data, status) {
		switch (status) {
			//链接状态
			case "connect failed":
			case "connect success":
			case "connect closed":
				userCallback(data, status);
				break;
			//收到消息
			case "onmessage":
				StarRtc.AUtils.parseProtocol(data, function (obj) {
					//这里可以区分不同的 APP_PRODUCT_ID 或 ACTION_GROUP_ID 再接入不同的处理逻辑
					var revProtocol = obj;
					switch (revProtocol.appid) {
						case APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER:
							StarRtc.AUtils.parseMessage(obj.msgArr, msgInnerCallback);
							break;
					}

				})
				break;
			case "onSingleMessage":
				data.msg = JSON.parse(data.msg);

				var type = status;

				if (data.msg.type == 0) {
					switch (data.msg.code) {
						case AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_CALL:
							data.type = "voipCall";
							type = "onVoipMessage";
							break;
						case AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_REFUSE:
							data.type = "voipRefuse";
							type = "onVoipMessage";
							break;
						case AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_HANGUP:
							data.type = "voipHangup";
							type = "onVoipMessage";
							break;
						case AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_BUSY:
							data.type = "voipBusy";
							type = "onVoipMessage";
							break;
						case AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_CONNECT:
							data.type = "voipConnect";
							type = "onVoipMessage";
							break;
						default:
							data.type = "voipSingleMsg";
							break;
					}
				}
				else {
					data.type = "voipSingleMsg";
				}

				var callback = null;

				if (extraIMCallback != null) {
					callback = extraIMCallback;
				}
				else {
					callback = userCallback;
				}
				callback(data, type);

				break;
			case "onLoginMessage":
			case "onGroupMessage":
			case "onGroupPrivateMessage":
			case "onGroupPushMessage":
			case "onSystemPushMessage":
			case "onErrorMessage":
			case "onGetGroupList":
			case "onGetOnlineNumber":
			case "onGetGroupUserList":
			case "onGetAllUserList":
				//解析后的消息
				if (extraIMCallback != null) {
					extraIMCallback(data, status);
				}
				userCallback(data, status);
				break;
		}

	}

	self.setLoginServerUrl = function (loginServerUrl) {
		self.loginServerUrl = loginServerUrl;
	}
	self.setMsgScheduleUrl = function (msgScheduleUrl) {
		self.msgScheduleUrl = msgScheduleUrl;
	}
	self.setChatRoomScheduleUrl = function (chatRoomScheduleUrl) {
		self.chatRoomScheduleUrl = chatRoomScheduleUrl;
	}
	self.setSrcScheduleUrl = function (srcScheduleUrl) {
		self.srcScheduleUrl = srcScheduleUrl;
	}
	self.setVdnScheduleUrl = function (vdnScheduleUrl) {
		self.vdnScheduleUrl = vdnScheduleUrl;
	}
	self.setVoipServerUrl = function (voipServerUrl) {
		self.voipServerUrl = voipServerUrl;
	}
	self.setWorkServerUrl = function (workServerUrl) {
		self.workServerUrl = workServerUrl;
	}
	self.setWebrtcServerIP = function (webrtcServerIP) {
		self.webrtcServerIP = webrtcServerIP;
	}

	self.setMsgServerInfo = function (msgServerUrl, msgServerWebsocketPort) {
		self.msgServerUrl = msgServerUrl;
		self.msgServerWebsocketPort = msgServerWebsocketPort;
	}

	self.setchatRoomServerInfo = function (chatRoomServerUrl, chatRoomServerWebsocketPort) {
		self.chatRoomServerUrl = chatRoomServerUrl;
		self.chatRoomServerWebsocketPort = chatRoomServerWebsocketPort;
	}

	self.setSrcServerInfo = function (srcServerUrl, srcServerWebsocketPort, srcServerWebrtcPort) {
		self.srcServerUrl = srcServerUrl;
		self.srcServerWebsocketPort = srcServerWebsocketPort;
		self.srcServerWebrtcPort = srcServerWebrtcPort;
	}

	self.setVdnServerInfo = function (vdnServerUrl, vdnServerWebsocketPort, vdnServerWebrtcPort) {
		self.vdnServerUrl = vdnServerUrl;
		self.vdnServerWebsocketPort = vdnServerWebsocketPort;
		self.vdnServerWebrtcPort = vdnServerWebrtcPort;
	}

	self.setVoipServerInfo = function (voipServerUrl, voipServerPort, voipServerWebsocketPort, voipServerWebrtcPort) {
		self.voipServerUrl = voipServerUrl;
		self.voipServerPort = voipServerPort;
		self.voipServerWebsocketPort = voipServerWebsocketPort;
		self.voipServerWebrtcPort = voipServerWebrtcPort;
	}

	self.setConfigModePulic = function (flag) {
		self.configModePulic = flag;
	}

	self.login = function (_agentId, _userId, _authKey, _callback) {
		if (!self.configModePulic) {
			_agentId = "APPID-FREE";
		}
		agentId = _agentId;
		userId = _userId;
		starUid = _agentId + "_" + _userId;
		authKey = _authKey;
		userCallback = _callback;
		StarRtc.StarManager.login(_agentId, _userId, _authKey, msgInnerCallback);
	}

	self.logout = function () {
		StarRtc.StarManager.close();
	}

	self.sendSingleMsg = function (_targetId, _digest, _txt, _type) {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructSingleMsg(
					_targetId,
					++_msgIndex,
					_digest,
					_txt,
					_type)
			)
		);
	}

	self.sendGroupMsg = function (_targetGroupId, _digest, _txt) {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructGroupMsg(
					_targetGroupId,
					++_msgIndex,
					_digest,
					_txt)
			)
		);
	}

	self.sendSingleCtrlMsg = function (_targetId, _digest, _txt, _code) {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructSingleCtrlMsg(
					_targetId,
					++_msgIndex,
					_digest,
					_txt,
					_code)
			)
		);
	}

	self.sendVoipCtrlMsg = function (_targetId, _code) {
		var _txt = "";
		if (_code == AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_CALL) {
			_txt = JSON.stringify({
				"VoIP_protocal_type": "TCP",
				"VoIP_server_IP": StarRtc.Instance.voipServerUrl,
				"VoIP_server_Port": StarRtc.Instance.voipServerPort
			});
		}
		self.sendSingleCtrlMsg(_targetId, "新消息", _txt, _code);
	}

	self.sendVoipCallMsg = function (_targetId, _ts) {
		var _txt = "";
		var ts = _ts || (new Date()).getTime();
		_txt = JSON.stringify({
			"VoIP_protocal_type": "TCP",
			"VoIP_server_IP": StarRtc.Instance.voipServerUrl,
			"VoIP_server_Port": StarRtc.Instance.voipServerPort,
			"ts": ts
		});
		self.sendSingleCtrlMsg(_targetId, "新消息", _txt, AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_CALL);
		//self.sendVoipCtrlMsg(_targetId, AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_CALL);
	}

	self.sendVoipRefuseMsg = function (_targetId) {
		self.sendVoipCtrlMsg(_targetId, AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_REFUSE);
	}

	self.sendVoipHungupMsg = function (_targetId) {
		self.sendVoipCtrlMsg(_targetId, AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_HANGUP);
		if (extraIMCallback != null) {
			extraIMCallback({ "type": "voipCancle" }, "onVoipMessage");
		}
	}

	self.sendVoipBusyMsg = function (_targetId) {
		self.sendVoipCtrlMsg(_targetId, AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_BUSY);
	}

	self.sendVoipConnectMsg = function (_targetId) {
		self.sendVoipCtrlMsg(_targetId, AG_MSG_VOIP_CTRL.CONTROL_CODE_VOIP_CONNECT);
	}

	self.setIMExtraback = function (_callback) {
		extraIMCallback = _callback;
	}

	self.getStarRoomSDK = function (_type, _oper, _userCallback, _userData, _config, _liveType, _starImInterface) {
		var starRoomSDK = new StarRtc.StarRoomSDK(_type, _oper, _userCallback, _userData, _config, _liveType, _starImInterface);
		starRoomSDK.login(agentId, userId, authKey);
		return starRoomSDK;
	}

	self.getVideoMeetingRoomSDK = function (_oper, _userCallback, _userData) {
		return self.getStarRoomSDK("src", _oper, _userCallback, _userData, 3, 1);
	}

	self.getVideoLiveRoomSDK = function (_type, _oper, _userCallback, _userData) {
		return self.getStarRoomSDK(_type, _oper, _userCallback, _userData, 3, 2);
	}

	self.getVoipRoomSDK = function (_oper, _userCallback, _userData) {
		return self.getStarRoomSDK("voip", _oper, _userCallback, _userData, 2, 0, self);
	}

	self.reportVideoMeetingRoom = function (roomInfo, callback) {
		self.reportRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_MEETING, roomInfo, callback);
	}

	self.reportVideoLiveRoom = function (roomInfo, callback) {
		self.reportRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_LIVE, roomInfo, callback);
	}

	self.reportVideoClassRoom = function (roomInfo, callback) {
		self.reportRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_CLASS, roomInfo, callback);
	}

	self.reportChatRoom = function (roomInfo, callback) {
		self.reportRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_CHATROOM, roomInfo, callback);
	}

	self.reportRoom = function (listType, roomInfo, callback) {

		if (StarRtc.Instance.configModePulic) return;

		var starWebsocket = null;

		var roomId = roomInfo.ID.substring(16, 33);
		var rf = {};
		rf.id = roomInfo.ID;
		rf.creator = roomInfo.Creator;
		rf.name = roomInfo.Name;

		var innerCallback = function (data, status) {
			data.obj = self;
			switch (status) {
				//链接状态
				case "connect success":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
							StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SAVE_TO_CHATROOM_LIST, { "roomId": roomId, "listType": listType, "userDefineData": encodeURIComponent(JSON.stringify(rf)) })
						)
					);
					break;
				case "connect failed":
					if (callback) callback("failed");
				case "connect closed":
					starWebsocket = null;
					break;
				case "onmessage":
					StarRtc.AUtils.parseProtocol(data, function (obj) {
						if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER) {
							//这里可以区分不同的 APP_PRODUCT_ID 或 ACTION_GROUP_ID 再接入不同的处理逻辑
							StarRtc.AUtils.parseChatMoonServerMessage(obj.msgArr, function (_data) {
								innerCallback(_data, "onChatRoomMessage");
							});
						}
					});
					break;
				case "onChatRoomMessage":
					{
						switch (data.type) {
							case "saveToChatroomList":
								if (callback) callback(data.status);
								starWebsocket.close();
								break;
						}
					}
					break;
			}
		}


		starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
		var url = "wss://" + StarRtc.Instance.chatRoomServerUrl + ":" + StarRtc.Instance.chatRoomServerWebsocketPort;
		starWebsocket.connect(url);
	}

	self.delVideoMeetingRoom = function (roomInfo, callback) {
		self.delRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_MEETING, roomInfo, callback);
	}

	self.delVideoLiveRoom = function (roomInfo, callback) {
		self.delRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_LIVE, roomInfo, callback);
	}

	self.delVideoClassRoom = function (roomInfo, callback) {
		self.delRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_CLASS, roomInfo, callback);
	}

	self.delChatRoom = function (roomInfo, callback) {
		self.delRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_CHATROOM, roomInfo, callback);
	}

	self.delRoom = function (listType, roomInfo, callback) {

		if (StarRtc.Instance.configModePulic) return;

		var starWebsocket = null;

		var roomId = roomInfo.ID.substring(16, 33);

		var innerCallback = function (data, status) {
			data.obj = self;
			switch (status) {
				//链接状态
				case "connect success":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
							StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DEL_FROM_CHATROOM_LIST, { "roomId": roomId, "listType": listType })
						)
					);
					break;
				case "connect failed":
					if (callback) callback("failed");
				case "connect closed":
					starWebsocket = null;
					break;
				case "onmessage":
					StarRtc.AUtils.parseProtocol(data, function (obj) {
						if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER) {
							//这里可以区分不同的 APP_PRODUCT_ID 或 ACTION_GROUP_ID 再接入不同的处理逻辑
							StarRtc.AUtils.parseChatMoonServerMessage(obj.msgArr, function (_data) {
								innerCallback(_data, "onChatRoomMessage");
							});
						}
					});
					break;
				case "onChatRoomMessage":
					{
						switch (data.type) {
							case "delFromToChatroomList":
								if (callback) callback(data.status);
								starWebsocket.close();
								break;
						}
					}
					break;
			}
		}


		starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
		var url = "wss://" + StarRtc.Instance.chatRoomServerUrl + ":" + StarRtc.Instance.chatRoomServerWebsocketPort;
		starWebsocket.connect(url);
	}

	self.queryVideoClassRoom = function (callback) {
		self.queryRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_CLASS, callback);
	}

	self.queryChatRoom = function (callback) {
		self.queryRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_CHATROOM, callback);
	}

	self.queryVideoMeetingRoom = function (callback) {
		self.queryRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_MEETING, callback);
	}

	self.queryVideoLiveRoom = function (callback) {
		self.queryRoom(CHATROOM_LIST_TYPE.CHATROOM_LIST_TYPE_LIVE, callback);
	}

	self.queryRoom = function (listTypes, callback) {

		if (StarRtc.Instance.configModePulic) return;

		var starWebsocket = null;

		var innerCallback = function (data, status) {
			data.obj = self;
			switch (status) {
				//链接状态
				case "connect success":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
							StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_QUERY_ALL_CHATROOM_LIST, { "listTypes": listTypes.toString(), "userId": "" })
						)
					);
					break;
				case "connect failed":
					if (callback) callback("failed");
				case "connect closed":
					starWebsocket = null;
					break;
				case "onmessage":
					StarRtc.AUtils.parseProtocol(data, function (obj) {
						if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER) {
							//这里可以区分不同的 APP_PRODUCT_ID 或 ACTION_GROUP_ID 再接入不同的处理逻辑
							StarRtc.AUtils.parseChatMoonServerMessage(obj.msgArr, function (_data) {
								innerCallback(_data, "onChatRoomMessage");
							});
						}
					});
					break;
				case "onChatRoomMessage":
					{
						switch (data.type) {
							case "queryAllChatroomList":
								if (data.listData == "") {
									if (callback) callback(data.status, []);
									break;
								}
								var listData = JSON.parse(data.listData);
								var userDefineDataList = listData.userDefineDataList.split(",");
								for (var i = 0; i < userDefineDataList.length; i++) {
									userDefineDataList[i] = JSON.parse(decodeURIComponent(userDefineDataList[i]));
									userDefineDataList[i].ID = userDefineDataList[i].id;
									userDefineDataList[i].Name = userDefineDataList[i].name;
									userDefineDataList[i].Creator = userDefineDataList[i].creator;
								}
								if (callback) callback(data.status, userDefineDataList);
								starWebsocket.close();
								break;
						}
					}
					break;
			}
		}


		starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
		var url = "wss://" + StarRtc.Instance.chatRoomServerUrl + ":" + StarRtc.Instance.chatRoomServerWebsocketPort;
		starWebsocket.connect(url);
	}

	self.getGroupList = function () {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructMsgProtocol(
					AG_MSG.MSG_CLIENT_GROUP_GET_GROUP_LIST,
					{ "reqIndex": 0 })
			)
		);
	}

	self.getGroupUserList = function (groupId) {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructMsgProtocol(
					AG_MSG.MSG_CLIENT_GROUP_GET_USER_LIST,
					{ "reqIndex": 0, "groupId": groupId })
			)
		);
	}

	self.getOnlineNumber = function () {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructMsgProtocol(
					AG_MSG.MSG_CLIENT_GET_ALIVE_NUMBER,
					{})
			)
		);
	}

	self.getAllUserList = function (reqPageNum) {
		StarRtc.StarManager.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_MSGSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_MSG,
				StarRtc.AUtils.constructMsgProtocol(
					AG_MSG.MSG_CLIENT_GET_ALL_USER_LIST,
					{ "reqPageNum": reqPageNum })
			)
		);

	}

	self.getInfo = function () {
		return {
			"agentId": agentId,
			"userId": userId,
			"authKey": authKey
		};
	}
}

////////////////////////////////////////////////////////////////////////////////

function clone(obj) {
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		var copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		var copy = [];
		var len = obj.length;
		for (var i = 0; i < len; ++i) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		var copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}


StarRtc.WebrtcWebsocket = function (_callback, _srcScheduleUrl) {
	var self = this;
	var srcScheduleUrl = _srcScheduleUrl;

	var callback = _callback;
	var starWebsocket = null;

	var heartbeat_timer;
	self.startHeartBeat = function (heartBeatMsg) {
		// console.log("发送心跳");

		starWebsocket.send(heartBeatMsg);

		heartbeat_timer = setInterval(function () {
			// console.log("发送心跳");
			starWebsocket.send(heartBeatMsg);
		}, 5000);
	}

	//停止心跳
	self.stopHeartBeat = function () {
		clearInterval(heartbeat_timer);
	}

	self.connect = function (url) {
		console.log('webrtcConnect' + url);
		starWebsocket = new WebSocket(url);

		//连接发生错误的回调方法
		starWebsocket.onerror = function (event) {
			console.log("WebSocket连接发生错误");
			callback({ "msg": "WebSocket连接发生错误", "data": event.data }, "connect failed");
		};

		//连接成功建立的回调方法
		starWebsocket.onopen = function () {
			console.log("WebSocket连接成功");
			callback({ "msg": "WebSocket连接成功" }, "connect success");
		};

		//接收到消息的回调方法
		starWebsocket.onmessage = function (event) {
			console.log("onmessage", event.data);
			callback(event.data, "onmessage");
		};

		//连接关闭的回调方法
		starWebsocket.onclose = function (event) {
			console.log("WebSocket连接关闭");
			self.stopHeartBeat();
			callback({ "msg": "WebSocket连接关闭", "data": event.code }, "connect closed");
			starWebsocket = null;
		};
	}

	self.starConnect = function (_callback) {
		$.get(srcScheduleUrl, function (data, status) {
			console.log("消息调度：", status, data);
			if (status === "success") {
				var obj = JSON.parse(data);
				if (obj.status == 1) {
					_callback("success", obj.data);
				}
				else {
					_callback("failed");
				}
			}
			else {
				_callback("failed");
			}
		});
	}

	self.send = function (msg) {
		starWebsocket.send(msg);
	}

	self.close = function () {
		if (starWebsocket != null) {
			starWebsocket.close();
		}
	}

	self.readyState = function () {
		if (starWebsocket != null) {
			return starWebsocket.readyState;
		}
		else {
			return -1;
		}
	}

	return self;
}

StarRtc.StarRoomSDK = function (_type, _oper, _userCallback, _userData, _config, _liveType, _starImInterface) {
	var chatConfig = 1;
	var videoConfig = 2;

	var meetingRoomLiveType = 1;
	var chatRoomLiveType = 2;

	var applyMsg = "我要上麦！";
	var applyOkMsg = "欢迎上麦！";
	var linkStopMsg = "上麦结束！";

	var applyLinkCode = 2000;
	var applyLinkAgreeCode = 2002;
	var applyLinkDisagreeCode = 2004;

	var inviteLinkCode = 2100;
	var inviteLinkAgreeCode = 2102;
	var inviteLinkStartCode = 2104;
	var inviteLinkDisagreeCode = 2106;

	var linkStopCode = 2200;

	var self = this;
	var agentId = "";
	var userId = "";
	var starUid = "";
	var authKey = "";

	var oper = _oper;
	var type = _type;

	var userData = _userData;
	var userCallback = _userCallback;

	var config = _config || 3;

	var chatEnable = (config & chatConfig) != 0;
	var videoEnable = (config & videoConfig) != 0;

	var starVideoSDK = null;
	var starVideoSDKUserData = null;
	var starChatSDK = null;
	var starChatSDKUserData = null;

	var activeDisconnect = false;

	var voipInterval = null;

	var starImInterface = _starImInterface;
	if (starImInterface != undefined && _type == "voip") {
		starImInterface.setIMExtraback(function (_data, status) {
			chatInnerCallback(_data, "onVoipMessage");
		});
	}

	function stopInterval() {
		if (voipInterval != null) {
			clearInterval(voipInterval);
			voipInterval = null;
		}
	}

	function startInterval(func, ms) {
		if (voipInterval != null) {
			stopInterval(voipInterval);
		}
		voipInterval = setInterval(func, ms);
	}

	function closeSDK(sdkObj) {
		if (sdkObj != null) {
			var state = sdkObj.getState();
			if (state >= 0 && state < 2) {
				sdkObj.sigDisconnect();
			}
		}
	}

	/* function reportRoom(roomInfo, type) {
		var url = "";
		if (type == 1) {
			url = StarRtc.Instance.worServerUrl + "/meeting/store?appid=" + agentId + "&ID=" + roomInfo.ID + "&Name=" + roomInfo.Name + "&Creator=" + roomInfo.Creator;
		}
		else if (type == 2) {
			url = StarRtc.Instance.worServerUrl + "/live/store?appid=" + agentId + "&ID=" + roomInfo.ID + "&Name=" + roomInfo.Name + "&Creator=" + roomInfo.Creator;
		}
		$.get(url);
	} */

	function allClosed() {
		var closed = true;
		if (chatEnable) {
			closed = closed && (starChatSDK.getState() == 3 || starChatSDK.getState() == -1);
		}
		if (videoEnable) {
			closed = closed && (starVideoSDK.getState() == 3 || starVideoSDK.getState() == -1);
		}
		return closed;
	}

	var videoInnerCallback = function (data, status) {
		data.userData = userData;
		data.obj = self;
		switch (status) {
			//链接状态
			case "connect success":
				userCallback(data, status, oper);
				break;
			case "connect closed":
			case "connect failed":
				stopInterval();
				if (chatEnable) {
					closeSDK(starChatSDK);
				}
				if (allClosed()) {
					userCallback(data, status, oper);
				}
				break;
			//收到消息
			case "onmessage":
				break;
			case "onWebrtcMessage":
				switch (data.type) {
					case "delChannel":
						if (data.status == "success") {
							/* if(chatEnable)
							{
								starChatSDK.deleteCurrRoom();
							}
							else{
								userCallback(data,status, oper);
							} */
							userCallback(data, status, oper);
						}
						else {
							alert("删除视频会议失败");
						}
						break;
					case "createChannel":
						if (data.status == "success") {
							userData.roomInfo.Creator = userId;
							if (chatEnable) {
								userData.roomInfo.ID = data.channelId + userData.roomInfo.ID;
								//reportRoom(userData.roomInfo, _liveType);
							}
							else {
								userData.roomInfo.ID = data.channelId;
							}
						}
						userCallback(data, status, oper);
						break;
					case "voipCallingAck":
						if (starImInterface != undefined) {
							stopInterval();
							var ts = (new Date()).getTime();
							var intervalFunc = function (targetId) {
								return function () {
									starImInterface.sendVoipCallMsg(targetId, ts);
								}
							};
							starImInterface.sendVoipCallMsg(userData.roomInfo.targetId, ts);
							startInterval(intervalFunc(userData.roomInfo.targetId), 3000);
						}
						break;
					case "voipResponseing":
						if (data.status == "success") {
							if (starImInterface != undefined) {
								starImInterface.sendVoipConnectMsg(userData.roomInfo.targetId);
							}
						}
						userCallback(data, status, oper);
						break;
					default:
						userCallback(data, status, oper);
						break;
				}
				break;
			default:
				break;
		}
	}

	var chatInnerCallback = function (data, status) {
		data.userData = userData;
		data.obj = self;
		switch (status) {
			//链接状态
			case "connect success":
				if (videoEnable) {
					starVideoSDK.sigConnect();
				}
				else {
					userCallback(data, status, oper);
				}
				break;
			case "connect failed":
			case "connect closed":
				if (videoEnable) {
					closeSDK(starVideoSDK);
				}
				if (allClosed()) {
					userCallback(data, status, oper);
				}
				break;
			//收到消息
			case "onmessage":
				break;
			case "onChatRoomMessage":
				{
					switch (data.type) {
						case "createChatRoom":
							if (data.status == "success") {
								userData.roomInfo.ID = data.chatroomId;
								userData.roomInfo.Creator = userId;
								if (videoEnable) {
									starVideoSDKUserData.roomInfo.Name = data.chatroomId;
									starVideoSDK.createNew();
								}
							}
							break;
						case "deleteChatRoom":
							if (data.status == "success") {
								if (videoEnable) {
									starVideoSDK.deleteCurrRoom();
								}
								else {
									userCallback(data, status, oper);
								}
							}
							break;
						case "joinChatRoom":
							if (data.status == "success") {
								if (videoEnable) {
									starVideoSDK.joinRoom();
								}
							}
							break;
						case "recvChatPrivateMsg":
							if (data.msg.type == 0) {
								switch (data.msg.code) {
									case applyLinkCode:
										data.msg.msgType = "apply";
										break;
									case applyLinkAgreeCode:
										data.msg.msgType = "applyAgree";
										break;
									case applyLinkDisagreeCode:
										data.msg.msgType = "applyDisagree";
										break;
									case linkStopCode:
										data.msg.msgType = "linkStop";
										break;
									case inviteLinkCode:
										data.msg.msgType = "invite";
										break;
									case inviteLinkAgreeCode:
										data.msg.msgType = "inviteAgree";
										break;
									case inviteLinkDisagreeCode:
										data.msg.msgType = "inviteDisagree";
										break;
									case inviteLinkStartCode:
										data.msg.msgType = "inviteLinkStart";
										break;
									default:
										data.msg.msgType = "common";
										break;
								}
							}
							break;
					}
					userCallback(data, status, oper);
				}
				break;
			case "onVoipMessage":
				{
					switch (data.type) {
						case "voipCall":
							if (data.fromId != userData.roomInfo.targetId) {
								starImInterface.sendVoipBusyMsg(data.fromId);
							}
							break;
						case "voipHangup":
							if (data.fromId == userData.roomInfo.targetId) {
								self.leaveRoom(true);
								userCallback(data, status, oper);
							}
							break;
						case "voipBusy":
							stopInterval();
							self.leaveRoom(true);
							userCallback(data, status, oper);
							break;
						case "voipConnect":
						case "voipRefuse":
							stopInterval();
							userCallback(data, status, oper);
							break;
						case "voipCancle":
							stopInterval();
							break;
						default:
							userCallback(data, status, oper);
							break;
					}
				}
				break;
			default:
				break;
		}
	}

	starVideoSDKUserData = clone(userData);
	starChatSDKUserData = clone(userData);

	if (videoEnable && chatEnable && userData.roomInfo.ID) {
		starVideoSDKUserData.roomInfo.ID = userData.roomInfo.ID.substring(0, 16);
		starChatSDKUserData.roomInfo.ID = userData.roomInfo.ID.substring(16, 33);
	}

	if (videoEnable) {
		starVideoSDK = new StarRtc.StarVideoSDK(_type, _oper, videoInnerCallback, starVideoSDKUserData, _liveType);
	}
	if (chatEnable) {
		starChatSDK = new StarRtc.StarChatSDK(_oper, chatInnerCallback, starChatSDKUserData);
	}

	self.login = function (_agentId, _userId, _authKey) {
		agentId = _agentId;
		userId = _userId;
		starUid = _agentId + "_" + _userId;
		authKey = _authKey;
		if (chatEnable) {
			starChatSDK.login(_agentId, _userId, _authKey);
		}
		if (videoEnable) {
			starVideoSDK.login(_agentId, _userId, _authKey);
		}
	}

	self.sigConnect = function () {
		activeDisconnect = false;
		if (chatEnable) {
			starChatSDK.sigConnect();
		}
		else if (videoEnable) {
			starVideoSDK.sigConnect();
		}
	}

	self.sigDisconnect = function (_flag) {
		if (_flag == undefined) {
			_flag = true;
		}
		activeDisconnect = _flag;
		if (videoEnable) {
			starVideoSDK.sigDisconnect();
		}
		else if (chatEnable) {
			starChatSDK.sigDisconnect();
		}
	}

	self.createNew = function () {
		if (type != "voip") {
			if (chatEnable) {
				starChatSDK.createNew();
			}
			else if (videoEnable) {
				starVideoSDK.createNew();
			}
		}
	}

	self.deleteCurrRoom = function () {
		if (type != "voip") {
			if (chatEnable) {
				starChatSDK.deleteCurrRoom();
			}
			else if (videoEnable) {
				starVideoSDK.deleteCurrRoom();
			}
		}
	}

	self.createStream = function (streamOption) {
		if (videoEnable) {
			starVideoSDK.createStream(streamOption);
		}
	}

	self.joinRoom = function () {
		if (chatEnable && oper != "new") {
			starChatSDK.joinRoom();
		}
		else if (videoEnable) {
			starVideoSDK.joinRoom();
		}
	}

	self.leaveRoom = function (_flag) {
		if (videoEnable) {
			switch (type) {
				case "voip":
					var flag = _flag || false;
					if (starImInterface != undefined && !flag) {
						starImInterface.sendVoipHungupMsg(userData.roomInfo.targetId);
					}
					starImInterface.setIMExtraback(null);
					break;
			}
			starVideoSDK.leaveRoom(flag);
		}
		else if (chatEnable) {
			starChatSDK.leaveRoom();
		}
	}

	self.streamConfigChange = function (upId) {
		if (videoEnable) {
			starVideoSDK.streamConfigChange(upId);
		}
	}

	self.sendChatMsg = function (msg) {
		if (chatEnable) {
			starChatSDK.sendChatMsg(msg);
		}
	}

	self.sendVoipMsg = function (msg) {
		if (type == "voip" && starImInterface != undefined) {
			starImInterface.sendSingleMsg(userData.roomInfo.targetId, "新媒体", msg);
		}
	}

	self.sendChatPrivateMsg = function (userId, msg) {
		if (chatEnable) {
			starChatSDK.sendChatPrivateMsg(userId, msg);
		}
	}

	self.sendApplyMsg = function () {
		if (chatEnable && videoEnable && type == "vdn") {
			starChatSDK.sendChatCtrlPrivateMsg(userData.roomInfo.Creator, applyMsg, applyLinkCode);
		}
	}

	self.sendApplyAgreeMsg = function (userId) {
		if (chatEnable && videoEnable && type == "src") {
			starChatSDK.sendChatCtrlPrivateMsg(userId, applyMsg, applyLinkAgreeCode);
		}
	}

	self.sendApplyDisagreeMsg = function (userId) {
		if (chatEnable && videoEnable && type == "src") {
			starChatSDK.sendChatCtrlPrivateMsg(userId, applyMsg, applyLinkDisagreeCode);
		}
	}

	self.sendInviteLinkMsg = function (userId) {
		if (chatEnable && videoEnable && type == "src") {
			starChatSDK.sendChatCtrlPrivateMsg(userId, applyMsg, inviteLinkCode);
		}
	}

	self.sendInviteLinkAgreeMsg = function () {
		if (chatEnable && videoEnable && type == "vdn") {
			starChatSDK.sendChatCtrlPrivateMsg(userData.roomInfo.Creator, applyMsg, inviteLinkAgreeCode);
		}
	}

	self.sendInviteLinkDisagreeMsg = function () {
		if (chatEnable && videoEnable && type == "vdn") {
			starChatSDK.sendChatCtrlPrivateMsg(userData.roomInfo.Creator, applyMsg, inviteLinkDisagreeCode);
		}
	}

	self.sendInviteLinkStartMsg = function () {
		if (chatEnable && videoEnable && type == "vdn") {
			starChatSDK.sendChatCtrlPrivateMsg(userData.roomInfo.Creator, applyMsg, inviteLinkStartCode);
		}
	}

	self.sendLinkStopMsg = function (userId) {
		if (chatEnable && videoEnable && type == "src") {
			starChatSDK.sendChatCtrlPrivateMsg(userId, applyMsg, linkStopCode);
		}
	}

	self.kickOutUser = function (kickOutUserId) {
		if (chatEnable) {
			starChatSDK.kickOutUser(kickOutUserId);
		}
	}

	self.banToSendMsg = function (banUserId, banTime) {
		if (chatEnable) {
			starChatSDK.banToSendMsg(banUserId, banTime);
		}
	}

	self.getRoomOnlineNum = function () {
		if (chatEnable) {
			starChatSDK.getRoomOnlineNum();
		}
	}

	self.sendStreamData = function (data) {
		if (videoEnable && type == "src") {
			starVideoSDK.sendStreamData(data);
		}
	}

	self.activeDisconnect = function () {
		return activeDisconnect;
	}

	self.getUserData = function () {
		return userData;
	}

	self.startLocalStream = function (dom) {
		if (videoEnable) {
			starVideoSDK.startLocalStream(dom);
		}
	}

	return self;
}

StarRtc.StarVideoSDK = function (_type, _oper, _userCallback, _userData, _liveType) {
	var self = this;
	var agentId = "";
	var userId = "";
	var starUid = "";
	var authKey = "";

	var userData = _userData;
	var type = _type;
	var userCallback = _userCallback;
	var oper = _oper;
	var starWebsocket = null;
	var fingerprint = "";
	var serverInfo = {};

	//!!!!!!!!!!test
	var tmpData = {}

	var liveType = _liveType || 1;

	var uperInfos =
	{
		"siv": 0,
		"uperInfos": {}
	}

	var oldBigVideo;
	var nowBigVideo;

	var rtc = StarWebRTC();
	rtc.init();

	var streamReady = false;

	var activeDisconnect = false;

	var innerSdpCallBack = function (_data) {
		//alert(_data.type + ":" + _data.status);
		switch (_data.type) {
			case "createOffer":
				if (_data.status == "success") {
					switch (type) {
						case "src":
							_data.channelId = userData.roomInfo.ID;
							break;
						case "vdn":
							//test
							_data.ssrc = _data.bigVideoSSRC;
							break;
						case "voip":
							_data.targetId = userData.roomInfo.targetId;
							_data.videoSSRC = _data.bigVideoSSRC;
							break;
					}

					self.joinRoomInternal(_data);
				}
				break;
			case "applyAnswer":
				if (_data.status == "success") {

				}
				break;
			case "":
				break;
		}
	}

	var innerStreamCreatedCallback = function (status, object) {
		var data = { "type": "streamCreated", "streamObj": object };
		data.userData = userData;
		data.obj = self;
		if (status == "success") {
			data.status = "success";
			userCallback(data, "onWebrtcMessage", oper);
		}
		else {
			data.status = "failed";
			userCallback(data, "onWebrtcMessage", oper);
		}
	}

	//拦截底层回调 处理后再向上回调用户callback
	var innerCallback = function (data, status) {
		data.userData = userData;
		data.obj = self;
		switch (status) {
			//链接状态
			case "connect success":
				var msg = null;
				switch (type) {
					case "src":
						msg = StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructHeartBeatMsg(AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_ALIVE)
						);
						break;
					case "vdn":
						msg = StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVEVDNMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructHeartBeatMsg(AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_ALIVE)
						);
						break;
				}
				starWebsocket.startHeartBeat(msg);
				rtc.setServerInfo({ "serverIp": serverInfo.ip, "serverPort": serverInfo.webrtcPort });
				userCallback(data, status, oper);
				break;
			case "connect failed":
			case "connect closed":
				rtc.destroy();
				starWebsocket = null;
				userCallback(data, status, oper);
				break;
			//收到消息
			case "onmessage":

				StarRtc.AUtils.parseProtocol(data, function (obj) {
					if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER) {
						//这里可以区分不同的 APP_PRODUCT_ID 或 ACTION_GROUP_ID 再接入不同的处理逻辑
						StarRtc.AUtils.parseSrcMoonServerMessage(obj.msgArr, function (_data) {
							innerCallback(_data, "onWebrtcMessage");
						});
					}
					else if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_LIVEVDNMOONSERVER) {
						StarRtc.AUtils.parseVdnMoonServerMessage(obj.msgArr, function (_data) {
							innerCallback(_data, "onWebrtcMessage");
						});
					}
					else if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_VOIPMOONSERVER) {
						StarRtc.AUtils.parseVoipMoonServerMessage(obj.msgArr, function (_data) {
							innerCallback(_data, "onWebrtcMessage");
						});
					}
				});
				break;
			case "onWebrtcMessage":
				switch (data.type) {
					case "uperStreamInfoUpdate":
						if (data.status == "success") {
							if (streamReady) {
								var maxCount = 7;
								for (var i = 0; i < maxCount; ++i) {
									var streamInfo = rtc.getStreamByIndex(i);
									var oldInfo = undefined;
									if (Object.keys(uperInfos.uperInfos).length != 0) {
										oldInfo = uperInfos.uperInfos[i];
									}
									var newInfo = data.msg.uperInfos[i];
									if (oldInfo == undefined && newInfo != undefined) {
										if (newInfo.userId != starUid) {
											userCallback({
												"type": "addUploader",
												"upId": newInfo.upId,
												"upUserId": newInfo.userId,
												"streamInfo": streamInfo,
												"room": self
											}, status, oper);
										}
									}
									else if (oldInfo != undefined && newInfo == undefined) {
										var bigFlag = nowBigVideo == oldInfo.upId;
										if (bigFlag) {
											oldBigVideo = undefined;
											nowBigVideo = undefined;
										}
										rtc.resetStreamInfo(streamInfo);
										userCallback({
											"type": "removeUploader",
											"upId": oldInfo.upId,
											"upUserId": oldInfo.userId,
											"streamInfo": streamInfo,
											"bigFlag": bigFlag,
											"room": self
										}, status, oper);
									}
									else if (oldInfo != undefined && newInfo != undefined) {
										if (oldInfo.userId != newInfo.userId) {
											userCallback({
												"type": "changeUploader",
												"upId": newInfo.upId,
												"oldUpUserId": oldInfo.userId,
												"newUpUserId": newInfo.userId,
												"streamInfo": streamInfo,
												"room": self
											}, status, oper);
										}
									}
								}
							}
							uperInfos = data.msg;
						}
						break;
					case "vdnWebrtcReg":
						if (data.status == "success") {
							switch (type) {
								case "vdn":
									fingerprint = data.fingerprint;
									starWebsocket.send(
										StarRtc.AUtils.packageProtocol(
											APP_PRODUCT_ID.APP_PRODUCT_LIVEVDNMOONSERVER,
											ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
											StarRtc.AUtils.constructVdnProtocol(AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_CHANNEL, { "channelId": userData.roomInfo.ID })
										)
									);
									break;
							}
						}
						else {
							console.log("vdnWebrtcReg failed");
						}
						break;
					case "vdnApplyDownload":
						if (data.status == "success") {
							rtc.emit("_webrtc_apply_ok", fingerprint, function () {
								streamReady = true;
								innerCallback({ "type": "uperStreamInfoUpdate", "status": "success", "msg": data.uperInfos }, "onWebrtcMessage");
							});

						}
						else {
							console.log("收到vdnApplyDownload failed");
						}
						userCallback(data, status, oper);
						break;
					case "srcApplyUpload":
						if (data.status == "success") {
							//test
							data.tmpData = tmpData

							console.log("收到_webrtc_apply_ok");
							rtc.emit("_webrtc_apply_ok", data.fingerprint, function () {
								streamReady = true;
								var cloneObj = clone(uperInfos);
								uperInfos.uperInfos = {};
								innerCallback({ "type": "uperStreamInfoUpdate", "status": "success", "msg": cloneObj }, "onWebrtcMessage");
							});
						}
						else {
							console.log("收到srcApplyUpload failed");
						}
						//解析后的消息
						userCallback(data, status, oper);
						break;
					case "streamConfig":
						if (data.status == "success") {
							if (oldBigVideo == nowBigVideo) {
								var streamInfo = rtc.getStreamByIndex(oldBigVideo);
								rtc.switchStreamInfo(streamInfo);
								break;
							}
							if (oldBigVideo != undefined) {
								var streamInfo = rtc.getStreamByIndex(oldBigVideo);
								rtc.switchStreamInfo(streamInfo);
							}
							if (nowBigVideo != undefined) {
								var streamInfo = rtc.getStreamByIndex(nowBigVideo);
								rtc.switchStreamInfo(streamInfo);
							}
						}
						else {

						}
						break;
					case "createChannel":
						if (data.status == "success") {
							userData.roomInfo.ID = data.channelId;
							userData.roomInfo.Creator = userId;
						}
						else {

						}
						userCallback(data, status, oper);
						break;
					case "delChannel":
						if (data.status == "success") {
							userData.roomInfo.ID = "";
						}
						else {

						}
						userCallback(data, status, oper);
						break;
					case "serverErr":

						break;
					case "voipResponseing":
					case "voipCalling":
						if (data.status == "success") {
							console.log("收到_webrtc_apply_ok");
							rtc.emit("_webrtc_apply_ok", data.fingerprint, function () {
								innerCallback({ "type": "voipStreamReady", "status": "success" }, "onWebrtcMessage");
							});
						}
						else {

						}
						userCallback(data, status, oper);
						break;
					case "voipStreamReady":
						var streamInfo = rtc.getStreamByIndex(0);
						rtc.switchStreamInfo(streamInfo);
						userCallback({
							"type": "voipStreamReady",
							"streamObj": streamInfo.streamObj,
							"room": self
						}, status, oper);
						break;
					default:
						userCallback(data, status, oper);
						break;
				}
				break;
		}

	}

	self.login = function (_agentId, _userId, _authKey) {
		agentId = _agentId;
		userId = _userId;
		starUid = _agentId + "_" + _userId;
		authKey = _authKey;
	}

	self.sigConnect = function () {
		activeDisconnect = false;
		serverInfo.ip = StarRtc.Instance.webrtcServerIP;
		starWebsocket = null;
		switch (type) {
			case "src":
				if (StarRtc.Instance.configModePulic) {
					var scheduleUrl = "https://" + StarRtc.Instance.srcScheduleUrl + ":" + StarRtc.Instance.srcSchedulePort + "?userId=" + starUid;
					starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, scheduleUrl);
				}
				else {
					starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
					var data = {};
					data.ip = StarRtc.Instance.srcServerUrl;
					serverInfo.websocketPort = StarRtc.Instance.srcServerWebsocketPort;
					serverInfo.webrtcPort = StarRtc.Instance.srcServerWebrtcPort;
					data.websocketPort = serverInfo.websocketPort;
					var url = "wss://" + data.ip + ":" + data.websocketPort;
					starWebsocket.connect(url);
					return;
				}
				break;
			case "vdn":
				if (StarRtc.Instance.configModePulic) {
					var scheduleUrl = "https://" + StarRtc.Instance.vdnScheduleUrl + ":" + StarRtc.Instance.vdnSchedulePort + "?userId=" + starUid + "&channelId=" + userData.channelId;
					starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, scheduleUrl);
				}
				else {
					starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
					var data = {};
					data.ip = StarRtc.Instance.vdnServerUrl;
					serverInfo.websocketPort = StarRtc.Instance.vdnServerWebsocketPort;
					serverInfo.webrtcPort = StarRtc.Instance.vdnServerWebrtcPort;
					data.websocketPort = serverInfo.websocketPort;
					var url = "wss://" + data.ip + ":" + data.websocketPort;
					starWebsocket.connect(url);
					return;
				}
				break;
			case "voip":
				starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
				var data = {};
				data.ip = StarRtc.Instance.voipServerUrl;
				serverInfo.websocketPort = StarRtc.Instance.voipServerWebsocketPort;
				serverInfo.webrtcPort = StarRtc.Instance.voipServerWebrtcPort;
				data.websocketPort = serverInfo.websocketPort;
				var url = "wss://" + data.ip + ":" + data.websocketPort;
				starWebsocket.connect(url);
				return;
			default:
				return;
		}
		starWebsocket.starConnect(function (status, data) {
			if (status == "success") {
				serverInfo.websocketPort = data.websocketPort;
				serverInfo.webrtcPort = data.webrtcPort;
				var url = "wss://" + data.ip + ":" + data.websocketPort;
				starWebsocket.connect(url);
			}
		});
	}

	self.sigDisconnect = function (_flag) {
		if (_flag == undefined) {
			_flag = true;
		}
		activeDisconnect = _flag;
		if (starWebsocket != null) {
			starWebsocket.close();
			starWebsocket = null;
		}
	}

	self.createNew = function () {
		if (starWebsocket != null) {
			switch (type) {
				case "src":
					var extra = "1";
					if (liveType == 2) {
						extra = "2";
					}
					var channelType = AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_GLOBAL_PUBLIC;
					if (userData.roomInfo.Type == 1) {
						channelType = AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CREATE_CHANNEL_LOGIN_PUBLIC;
					}
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructSrcProtocol(
								channelType,
								{ "conCurrentNum": 7, "roomId": userData.roomInfo.Name, "extra": extra, "liveType": parseInt(extra) })
						)
					);
					break;
			}
		}
	}

	self.deleteCurrRoom = function () {
		if (starWebsocket != null) {
			switch (type) {
				case "src":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructSrcProtocol(AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_DELETE_CHANNEL, { "channelId": userData.roomInfo.ID })
						)
					);
					break;
			}
		}
	}

	self.createStream = function (streamOption) {
		if (streamOption == undefined) {
			streamOption = {
				"video": { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 25 }, facingMode: { ideal: ["user"] } },
				"audio": { deviceId: { ideal: ["default"] } }
			}
		}
		rtc.createStream(streamOption, innerStreamCreatedCallback);
	}

	self.joinRoom = function () {
		rtc.emit("ready", innerSdpCallBack, type == "voip" ? true : false);
	}

	self.joinRoomInternal = function (_data) {
		tmpData = _data
		switch (type) {
			case "src":
				starWebsocket.send(
					StarRtc.AUtils.packageProtocol(
						APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
						ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
						StarRtc.AUtils.constructWebrtcUploadMsgProtocol(_data)
					)
				);
				//alert("joinRoomInternal send");
				break;
			case "vdn":
				starWebsocket.send(
					StarRtc.AUtils.packageProtocol(
						APP_PRODUCT_ID.APP_PRODUCT_LIVEVDNMOONSERVER,
						ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
						StarRtc.AUtils.constructVdnProtocol(AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_WEBRTC_REG_SSRC, _data)
					)
				);
				break;
			case "voip":
				if (oper == "call") {
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_VOIPMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_VOIP,
							StarRtc.AUtils.constructVOIPProtocol(AG_VOIPMOONSERVER.VOIPMOONSERVER_CALLING_WEBRTC, _data)
						)
					);
				}
				else if (oper == "response") {
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_VOIPMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_VOIP,
							StarRtc.AUtils.constructVOIPProtocol(AG_VOIPMOONSERVER.VOIPMOONSERVER_RESPONSEING_WEBRTC, _data)
						)
					);
				}
				break;
		}
	}

	self.leaveRoom = function (flag) {
		if (starWebsocket != null && starWebsocket.readyState() == 1) {
			switch (type) {
				case "src":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructSrcProtocol(
								AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_CLOSE_CHANNEL,
								{ "channelId": userData.roomInfo.ID }
							)
						)
					);
					break;
				case "vdn":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVEVDNMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructVdnProtocol(
								AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_STOP_DOWNLOAD,
								{}
							)
						)
					);
				case "voip":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_VOIPMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_VOIP,
							StarRtc.AUtils.constructVOIPProtocol(AG_VOIPMOONSERVER.VOIPMOONSERVER_STOP, { "isActive": flag ? 0 : 1 })
						)
					);
					break;
					break;
			}
		}
	}

	self.streamConfigChange = function (upId) {
		if (starWebsocket != null) {
			if (nowBigVideo == upId) {
				nowBigVideo = oldBigVideo;
				oldBigVideo = upId
			}
			else {
				oldBigVideo = nowBigVideo;
				nowBigVideo = upId;
			}

			var streamInfos = rtc.getStreamInfos();
			var streamConfig = [];
			for (var i in streamInfos) {
				var conf = 0;
				if (oldBigVideo == nowBigVideo) {
					conf = !streamInfos[i].switchFlag ? 2 : 1;
				}
				else if (i == oldBigVideo) {
					conf = 1;
				}
				else if (i == nowBigVideo) {
					conf = 2;
				}
				else {
					conf = streamInfos[i].switchFlag ? 2 : 1
				}
				streamConfig.push(conf);
			}
			switch (type) {
				case "src":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructSrcProtocol(AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_PEER_STREAM_DOWNLOAD_CONFIG_APPLY, { "streamConfig": streamConfig })
						)
					);
					break;
				case "vdn":
					starWebsocket.send(
						StarRtc.AUtils.packageProtocol(
							APP_PRODUCT_ID.APP_PRODUCT_LIVEVDNMOONSERVER,
							ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
							StarRtc.AUtils.constructVdnProtocol(AG_LIVEVDNMOONSERVER.LIVEVDNMOONSERVER_DOWNLOAD_STREAM_CONFIG_APPLY, { "streamConfig": streamConfig })
						)
					);
					break;
			}
		}
	}

	self.getState = function () {
		if (starWebsocket != null) {
			return starWebsocket.readyState();
		}
		else {
			return -1;
		}
	}

	self.getType = function () {
		return type;
	}

	self.sendStreamData = function (data) {
		var LIVE_STREAM_DATA_REALTIME = 8;
		switch (type) {
			case "src":
				starWebsocket.send(
					StarRtc.AUtils.packageProtocol(
						APP_PRODUCT_ID.APP_PRODUCT_LIVESRCMOONSERVER,
						ACTION_GROUP_ID.ACTIONGROUP_LIVESTREAM,
						StarRtc.AUtils.constructSrcProtocol(AG_LIVESRCMOONSERVER.LIVESRCMOONSERVER_UPLOAD_STREAM, { "streamData": data, "streamDataType": LIVE_STREAM_DATA_REALTIME })
					)
				);
				break;
		}
	}

	self.activeDisconnect = function () {
		return activeDisconnect;
	}

	self.startLocalStream = function (dom) {
		rtc.startLocalStream(dom);
	}

	return self;
}

StarRtc.StarChatSDK = function (_oper, _userCallback, _userData) {
	var self = this;
	var agentId = "";
	var userId = "";
	var starUid = "";
	var authKey = "";
	var serverInfo = {};

	var userData = _userData;
	var userCallback = _userCallback;
	var oper = _oper;
	var starWebsocket = null;

	var digest = "新消息";
	var msgIndex = 0;

	var activeDisconnect = false;

	var innerCallback = function (data, status) {
		data.userData = userData;
		data.obj = self;
		switch (status) {
			case "connect success":
				var msg = null;
				msg = StarRtc.AUtils.packageProtocol(
					APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
					ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
					StarRtc.AUtils.constructHeartBeatMsg(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_ALIVE)
				);
				starWebsocket.startHeartBeat(msg);
				userCallback(data, status, oper);
				break;
			case "connect failed":
			case "connect closed":
				starWebsocket = null;
				userCallback(data, status, oper);
				break;
			//收到消息
			case "onmessage":
				StarRtc.AUtils.parseProtocol(data, function (obj) {
					if (obj.appid == APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER) {
						//这里可以区分不同的 APP_PRODUCT_ID 或 ACTION_GROUP_ID 再接入不同的处理逻辑
						StarRtc.AUtils.parseChatMoonServerMessage(obj.msgArr, function (_data) {
							innerCallback(_data, "onChatRoomMessage");
						});
					}
				});
				break;
			case "onChatRoomMessage":
				{
					switch (data.type) {
						case "createChatRoom":
							if (data.status == "success") {
								userData.roomInfo.ID = data.chatroomId;
								userData.roomInfo.Creator = userId;
							}
							break;
						case "deleteChatRoom":
							if (data.status == "success") {

							}
							break;
						case "joinChatRoom":
							if (data.status == "success") {

							}
							break;
						case "recvChatPrivateMsg":
						case "recvChatMsg":
							if (data.fromUserId != "" && data.msg != "") {
								data.msg = JSON.parse(data.msg);
								if (data.msg.fromId == userId) {
									return;
								}
							}
							else {
								return;
							}
							break;
					}
					userCallback(data, status, oper);
				}
				break;
		}
	}

	self.login = function (_agentId, _userId, _authKey) {
		agentId = _agentId;
		userId = _userId;
		starUid = _agentId + "_" + _userId;
		authKey = _authKey;
	}

	self.sigConnect = function () {
		activeDisconnect = false;
		if (StarRtc.Instance.configModePulic) {
			var scheduleUrl = "https://" + StarRtc.Instance.chatRoomScheduleUrl + ":" + StarRtc.Instance.chatRoomSchedulePort + "/?userId=" + starUid;
			starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, scheduleUrl);
			starWebsocket.starConnect(function (status, data) {
				if (status == "success") {
					var tmp = data.split(":");
					serverInfo.ip = tmp[0];
					serverInfo.port = tmp[1];
					var url = "wss://" + serverInfo.ip + ":" + serverInfo.port;
					starWebsocket.connect(url);
				}
			});
		}
		else {
			starWebsocket = new StarRtc.WebrtcWebsocket(innerCallback, null);
			serverInfo.ip = StarRtc.Instance.chatRoomServerUrl;
			serverInfo.port = StarRtc.Instance.chatRoomServerWebsocketPort;
			var url = "wss://" + serverInfo.ip + ":" + serverInfo.port;
			starWebsocket.connect(url);
		}
	}

	self.sigDisconnect = function (_flag) {
		if (_flag == undefined) {
			_flag = true;
		}
		activeDisconnect = _flag;
		if (starWebsocket != null) {
			starWebsocket.close();
			starWebsocket = null;
		}
	}

	self.createNew = function () {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_CREATE_ROOM, { "roomType": userData.roomInfo.Type == 0 ? 1 : 2, "conCurrentNum": 100, "userDefineData": userData.roomInfo.Name })
			)
		);
	}

	self.sendChatMsg = function (msg) {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SEND_MSG,
					{ "roomId": userData.roomInfo.ID, "digest": digest, "msgIndex": ++msgIndex, "msg": msg })
			)
		);
	}

	self.sendChatPrivateMsg = function (toUserId, msg) {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SEND_PRIVATE_MSG,
					{ "toUserId": toUserId, "roomId": userData.roomInfo.ID, "digest": digest, "msgIndex": ++msgIndex, "msg": msg, "type": "1", "code": "0" })
			)
		);
	}

	self.sendChatCtrlPrivateMsg = function (toUserId, msg, code) {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_SEND_PRIVATE_MSG,
					{ "toUserId": toUserId, "roomId": userData.roomInfo.ID, "digest": digest, "msgIndex": ++msgIndex, "msg": msg, "type": "0", "code": code })
			)
		);
	}

	self.kickOutUser = function (kickOutUserId) {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_KICKOUT_USER, { "kickOutUserId": kickOutUserId })
			)
		);
	}

	self.banToSendMsg = function (banUserId, banTime) {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_BAN_TO_SEND_MSG, { "banUserId": banUserId, "banTime": banTime })
			)
		);
	}

	self.getRoomOnlineNum = function () {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_GET_ROOM_ONLINE_NUM, { "roomId": userData.roomInfo.ID })
			)
		);
	}

	self.deleteCurrRoom = function () {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_DELETE_ROOM)
			)
		);
	}

	self.joinRoom = function () {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_JOIN_ROOM, { "roomId": userData.roomInfo.ID })
			)
		);
		//alert("chart joinRoom");
	}

	self.leaveRoom = function () {
		starWebsocket.send(
			StarRtc.AUtils.packageProtocol(
				APP_PRODUCT_ID.APP_PRODUCT_CHATROOMMOONSERVER,
				ACTION_GROUP_ID.ACTIONGROUP_CHATROOM,
				StarRtc.AUtils.constructChatProtocol(AG_CHATROOMMOONSERVER.CHATROOMMOONSERVER_LEAVE_ROOM)
			)
		);
	}

	self.getState = function () {
		if (starWebsocket != null) {
			return starWebsocket.readyState();
		}
		else {
			return -1;
		}
	}

	self.activeDisconnect = function () {
		return activeDisconnect;
	}

	return self;
}

module.exports = exports = StarRtc;