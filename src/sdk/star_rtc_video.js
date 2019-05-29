var sdpUtils = new SdpUtils();

function SdpUtils() {
	function ICEInfo() {
		this.iceUfrag = "";
		this.icePwd = "";
		this.iceOptions = "";
	}

	function FingerprintInfo() {
		this.algorithm = "";
		this.value = "";
	}

	function CodecInfo() {
		this.playload = 0;
		this.codecName = "";
		this.codecInterval = "";
		this.rtcpFB = [];
		this.fmtp = [];
	}

	function SSRCInfo() {
		this.ssrc = 0;
		this.cname = "";
		this.mslabel = "";
		this.label = "";
	}

	function MediaDesc() {
		this.type = "";
		this.protocol = "";
		this.iceInfo = new ICEInfo();
		this.fingerprintInfo = new FingerprintInfo();
		this.setup = "";
		this.mid = "";
		this.msid = "";
		this.extmap = {};
		this.commAbility = "";
		this.rtcpMux = true;
		this.rtcpResize = false;
		this.codecInfoMap = {};
		this.codecInfoArray = [];
		this.ssrcInfoMap = {};
		this.ssrcInfoArray = [];
		this.ssrcGroup = [];
		this.candidate = [];
	}

	function SdpDesc() {
		this.version = 0;
		this.username = "-";
		this.sessionID = 0;
		this.sessionVersion = 0;
		this.sessionName = "-";
		this.sessionStartTime = 0;
		this.sessionEndTime = 0;

		this.iceInfo = new ICEInfo();
		this.fingerprintInfo = new FingerprintInfo();

		this.group = [];
		this.wms = [];

		this.mediaDesc = [];

	}

	SdpUtils.prototype.clone = function clone(obj) {
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

	SdpUtils.prototype.parseSdp = function (sdpDescStr) {
		var sdpDesc = new SdpDesc();

		var lines = sdpDescStr.split("\r\n");
		var mVideo = false;
		var mAudio = false;
		var mLine = false;
		var mediaDesc = null;
		for (var i in lines) {
			var cmd = lines[i].charAt(0);
			switch (cmd) {
				case "v":
					sdpDesc.version = parseInt(lines[i].substring(2));
					break;
				case "o":
					var info = lines[i].substring(2).split(" ");
					sdpDesc.username = info[0];
					sdpDesc.sessionID = info[1];
					sdpDesc.sessionVersion = info[2];
					break;
				case "s":
					sdpDesc.sessionName = lines[i].substring(2);
					break;
				case "t":
					var info = lines[i].substring(2).split(" ");
					sdpDesc.sessionStartTime = parseInt(info[0]);
					sdpDesc.sessionEndTime = parseInt(info[1]);
					break;
				case "m":
					if (mediaDesc != null) {
						sdpDesc.mediaDesc.push(mediaDesc);
						mediaDesc = null;
					}
					var info = lines[i].substring(2).split(" ");
					mediaDesc = new MediaDesc();
					mediaDesc.type = info[0];
					mediaDesc.protocol = info[2];

					for (var i = 3; i < info.length; ++i) {
						var codecInfo = new CodecInfo();
						codecInfo.playload = parseInt(info[i]);
						mediaDesc.codecInfoMap[codecInfo.playload] = codecInfo;
						mediaDesc.codecInfoArray.push(codecInfo);
					}
					mLine = true;
					break;
				case "a":
					if (!mLine) {
						if (lines[i].indexOf("group:BUNDLE") != -1) {
							var info = lines[i].split(" ");
							for (var i = 1; i < info.length; ++i) {
								sdpDesc.group.push(info[i]);
							}
						}
						else if (lines[i].indexOf("msid-semantic:") != -1) {
							var info = lines[i].split(" ");
							sdpDesc.wms.push(info[info.length - 1]);
						}
						else if (lines[i].indexOf("a=ice-ufrag:") != -1) {
							sdpDesc.iceInfo.iceUfrag = lines[i].substring(12);
						}
						else if (lines[i].indexOf("a=ice-pwd:") != -1) {
							sdpDesc.iceInfo.icePwd = lines[i].substring(10);
						}
						else if (lines[i].indexOf("a=ice-options:") != -1) {
							sdpDesc.iceInfo.iceOptions = lines[i].substring(14);
						}
						else if (lines[i].indexOf("a=fingerprint:") != -1) {
							var info = lines[i].substring(14).split(" ");
							sdpDesc.fingerprintInfo.algorithm = info[0];
							sdpDesc.fingerprintInfo.value = info[1];
						}
					}
					else {
						if (lines[i].indexOf("a=ice-ufrag:") != -1) {
							mediaDesc.iceInfo.iceUfrag = lines[i].substring(12);
						}
						else if (lines[i].indexOf("a=ice-pwd:") != -1) {
							mediaDesc.iceInfo.icePwd = lines[i].substring(10);
						}
						else if (lines[i].indexOf("a=ice-options:") != -1) {
							mediaDesc.iceInfo.iceOptions = lines[i].substring(14);
						}
						else if (lines[i].indexOf("a=fingerprint:") != -1) {
							var info = lines[i].substring(14).split(" ");
							mediaDesc.fingerprintInfo.algorithm = info[0];
							mediaDesc.fingerprintInfo.value = info[1];
						}
						else if (lines[i].indexOf("a=setup:") != -1) {
							mediaDesc.setup = lines[i].substring(8);
						}
						else if (lines[i].indexOf("a=mid:") != -1) {
							mediaDesc.mid = lines[i].substring(6);
						}
						else if (lines[i].indexOf("a=extmap:") != -1) {
							var info = lines[i].substring(9).split(" ");
							mediaDesc.extmap[info[0]] = info[1];
						}
						else if (lines[i].indexOf("a=rtcp-mux") != -1) {
							mediaDesc.rtcpMux = true;
						}
						else if (lines[i].indexOf("a=rtcp-rsize") != -1) {
							mediaDesc.rtcpResize = true;
						}
						else if (lines[i].indexOf("a=sendrecv") != -1 ||
							lines[i].indexOf("a=sendonly") != -1 ||
							lines[i].indexOf("a=recvonly") != -1 ||
							lines[i].indexOf("a=inactive") != -1
						) {

							mediaDesc.commAbility = lines[i].substring(2);
						}
						else if (lines[i].indexOf("a=rtpmap:") != -1) {
							var info = lines[i].substring(9).split(" ");
							var codecInfo = mediaDesc.codecInfoMap[info[0]];
							var index = info[1].indexOf("/");
							var codecParas = info[1].split("/");
							codecInfo.codecName = info[1].substring(0, index);
							codecInfo.codecInterval = info[1].substring(index + 1);
						}
						else if (lines[i].indexOf("a=rtcp-fb:") != -1) {
							var index = lines[i].indexOf(" ");
							var playload = lines[i].substring(10, index);
							var info = lines[i].substring(index + 1);
							var codecInfo = mediaDesc.codecInfoMap[playload];
							codecInfo.rtcpFB.push(info);
						}
						else if (lines[i].indexOf("a=fmtp:") != -1) {
							var info = lines[i].substring(7).split(" ");
							var codecInfo = mediaDesc.codecInfoMap[info[0]];
							codecInfo.fmtp.push(info[1]);
						}
						else if (lines[i].indexOf("a=msid:") != -1) {
							var msid = lines[i].substring(7);
							mediaDesc.msid = msid;
						}
						else if (lines[i].indexOf("a=ssrc:") != -1) {
							var index = lines[i].indexOf(" ");
							var ssrcValue = lines[i].substring(7, index);
							var info = lines[i].substring(index + 1).split(":");
							var ssrcInfo = mediaDesc.ssrcInfoMap[ssrcValue];
							if (!ssrcInfo) {
								ssrcInfo = new SSRCInfo();
								ssrcInfo.ssrc = ssrcValue;
								mediaDesc.ssrcInfoArray.push(ssrcInfo);
							}
							if (info[0] == "cname") {
								ssrcInfo.cname = info[1];
							}
							else if (info[0] == "msid") {
								ssrcInfo.msid = info[1];
							}
							else if (info[0] == "mslabel") {
								ssrcInfo.mslabel = info[1];
							}
							else if (info[0] == "label") {
								ssrcInfo.label = info[1];
							}
							mediaDesc.ssrcInfoMap[ssrcValue] = ssrcInfo;
						}
						else if (lines[i].indexOf("a=ssrc-group:") != -1) {
							var info = lines[i].substring(13).split(" ");
							for (var i in info) {
								mediaDesc.ssrcGroup.push(info[i]);
							}
						}
						else if (lines[i].indexOf("a=candidate:") != -1) {
							var info = lines[i].substring(12);
							mediaDesc.candidate.push(info);
						}
					}
					break;
			}
		}
		if (mediaDesc != null) {
			sdpDesc.mediaDesc.push(mediaDesc);
			mediaDesc = null;
		}

		return sdpDesc;
	}

	SdpUtils.prototype.genIceInfoSdp = function (iceObj) {
		var sdpStr = "";
		if (iceObj.iceUfrag != "") {
			sdpStr += "a=ice-ufrag:" + iceObj.iceUfrag + "\r\n";
		}
		if (iceObj.icePwd != "") {
			sdpStr += "a=ice-pwd:" + iceObj.icePwd + "\r\n";
		}
		if (iceObj.iceOptions != "") {
			sdpStr += "a=ice-options:" + iceObj.iceOptions + "\r\n";
		}
		return sdpStr;
	}

	SdpUtils.prototype.genFingerprintSdp = function (fpObj) {
		var sdpStr = "";
		if (fpObj.algorithm != "") {
			sdpStr += "a=fingerprint:" + fpObj.algorithm + " " + fpObj.value + "\r\n";
		}
		return sdpStr;
	}

	SdpUtils.prototype.genCodecSdp = function (codecObj) {
		var sdpStr = "";
		sdpStr += "a=rtpmap:" + codecObj.playload + " " + codecObj.codecName + "/" + codecObj.codecInterval + "\r\n";
		for (var i in codecObj.rtcpFB) {
			sdpStr += "a=rtcp-fb:" + codecObj.playload + " " + codecObj.rtcpFB[i] + "\r\n";
		}
		for (var i in codecObj.fmtp) {
			sdpStr += "a=fmtp:" + codecObj.playload + " " + codecObj.fmtp[i] + "\r\n";
		}
		return sdpStr;
	}

	SdpUtils.prototype.genSSRCSdp = function (ssrcObj) {
		var sdpStr = "";
		if (ssrcObj.cname) {
			sdpStr += "a=ssrc:" + ssrcObj.ssrc + " cname:" + ssrcObj.cname + "\r\n";
		}
		if (ssrcObj.msid) {
			sdpStr += "a=ssrc:" + ssrcObj.ssrc + " msid:" + ssrcObj.msid + "\r\n";
		}
		if (ssrcObj.mslabel) {
			sdpStr += "a=ssrc:" + ssrcObj.ssrc + " mslabel:" + ssrcObj.mslabel + "\r\n";
		}
		if (ssrcObj.label) {
			sdpStr += "a=ssrc:" + ssrcObj.ssrc + " label:" + ssrcObj.label + "\r\n";
		}
		return sdpStr;
	}

	SdpUtils.prototype.genMediaSdp = function (mediaObj) {
		var sdpStr = "";
		sdpStr += "m=" + mediaObj.type + " 9 " + mediaObj.protocol;
		var codecStr = "";
		for (var i in mediaObj.codecInfoArray) {
			var codecObj = mediaObj.codecInfoArray[i];
			sdpStr += " " + codecObj.playload;
			codecStr += this.genCodecSdp(codecObj);
		}
		sdpStr += "\r\n"
		sdpStr += "c=IN IP4 0.0.0.0\r\n"
		for (var i in mediaObj.candidate) {
			sdpStr += "a=candidate:" + mediaObj.candidate[i] + "\r\n";
		}
		if (mediaObj.candidate.length > 0) {
			sdpStr += "a=end-of-candidates\r\n";
		}
		sdpStr += "a=" + mediaObj.commAbility + "\r\n";
		sdpStr += "a=setup:" + mediaObj.setup + "\r\n";
		sdpStr += "a=mid:" + mediaObj.mid + "\r\n";
		if (mediaObj.msid) {
			sdpStr += "a=msid:" + mediaObj.msid + "\r\n";
		}
		sdpStr += this.genIceInfoSdp(mediaObj.iceInfo);
		sdpStr += this.genFingerprintSdp(mediaObj.fingerprintInfo);
		if (mediaObj.rtcpMux == true) {
			sdpStr += "a=rtcp-mux\r\n";
		}
		if (mediaObj.rtcpResize == true) {
			sdpStr += "a=rtcp-rsize\r\n";
		}
		for (var key in mediaObj.extmap) {
			sdpStr += "a=extmap:" + key + " " + mediaObj.extmap[key] + "\r\n";
		}
		sdpStr += codecStr;
		if (mediaObj.ssrcGroup.length) {
			sdpStr += "a=ssrc-group:FID " + mediaObj.ssrcGroup.join(" ") + "\r\n";
		}
		for (var i in mediaObj.ssrcInfoArray) {
			sdpStr += this.genSSRCSdp(mediaObj.ssrcInfoArray[i]);
		}
		return sdpStr;
	}

	SdpUtils.prototype.genSdp = function (sdpDescObj) {
		var sdpStr = "";
		sdpStr += "v=" + sdpDescObj.version + "\r\n";
		sdpStr += "o=" + sdpDescObj.username + " " + sdpDescObj.sessionID + " " + sdpDescObj.sessionVersion + " IN IP4 127.0.0.1\r\n";
		sdpStr += "s=" + sdpDescObj.sessionName + "\r\n";
		sdpStr += "t=" + sdpDescObj.sessionStartTime + " " + sdpDescObj.sessionEndTime + "\r\n";
		var tmpStr = "";
		var tmp2Str = "";
		for (var i in sdpDescObj.mediaDesc) {
			tmp2Str += " " + sdpDescObj.mediaDesc[i].mid;
			tmpStr += this.genMediaSdp(sdpDescObj.mediaDesc[i]);
		}
		if (tmp2Str != "") {
			sdpStr += "a=group:BUNDLE" + tmp2Str + "\r\n";
		}
		if (sdpDescObj.wms.length != 0) {
			sdpStr += "a=msid-semantic:WMS *\r\n";
		}
		sdpStr += this.genIceInfoSdp(sdpDescObj.iceInfo);
		sdpStr += this.genFingerprintSdp(sdpDescObj.fingerprintInfo);
		sdpStr += tmpStr;
		return sdpStr;
	}
}

var StarWebRTC = function () {
	var PeerConnection = RTCPeerConnection;
	var getUserMedia = navigator.mediaDevices.getUserMedia;
	var nativeRTCIceCandidate = RTCIceCandidate;
	var nativeRTCSessionDescription = RTCSessionDescription;
	var moz = !!navigator.mozGetUserMedia;
	var iceServer = {
	};
	var packetSize = 1000;

	/**********************************************************/
	/*                                                        */
	/*                       事件处理器                       */
	/*                                                        */
	/**********************************************************/
	function EventEmitter() {
		this.events = {};
	}
	//绑定事件函数
	EventEmitter.prototype.on = function (eventName, callback) {
		this.events[eventName] = this.events[eventName] || [];
		this.events[eventName].push(callback);
	};
	//触发事件函数
	EventEmitter.prototype.emit = function (eventName, _) {
		var events = this.events[eventName],
			args = Array.prototype.slice.call(arguments, 1),
			i, m;

		if (!events) {
			return;
		}
		for (i = 0, m = events.length; i < m; i++) {
			events[i].apply(null, args);
		}
	};


	/**********************************************************/
	/*                                                        */
	/*                   流及信道建立部分                     */
	/*                                                        */
	/**********************************************************/


	/*******************基础部分*********************/
	function starwebrtc() {
		//本地media stream
		this.localMediaStream = null;
		//所在房间
		this.room = "";
		//接收文件时用于暂存接收文件
		this.fileData = {};
		//本地WebSocket连接
		this.socket = null;
		//本地socket的id，由后台服务器创建
		this.me = null;
		//保存所有与本地相连的peer connection， 键为socket id，值为PeerConnection类型
		this.peerConnections = {};
		//保存所有与本地连接的socket的id
		this.connections = [];
		//初始时需要构建链接的数目
		this.numStreams = 0;
		//初始时已经连接的数目
		this.initializedStreams = 0;
		//保存所有的data channel，键为socket id，值通过PeerConnection实例的createChannel创建
		this.dataChannels = {};
		//保存所有发文件的data channel及其发文件状态
		this.fileChannels = {};
		//保存所有接受到的文件
		this.receiveFiles = {};

		this.bigStreamId = "";
		this.smallStreamId = "";
		this.audioStreamId = "";

		this.bigSSRC = "";
		this.smallSSRC = "";

		this.audioSSRC = "";

		this.answerSDP = "";

		this.offerSDP = {};

		this.starPeerConnection = null;
		this.tempPC = null;

		this.callback = null;
		this.streamAllsetCallback = null;

		this.serverIp = "0.0.0.0";
		this.serverPort = 80;

		this.streamInfos = [];
	}
	//继承自事件处理器，提供绑定事件和触发事件的功能
	starwebrtc.prototype = new EventEmitter();

	/*******************stream部分*********************/
	function streamInfo() {
		this.videoId = "";
		this.streamId = "";
		this.bigVideoSSRC = 0;
		this.smallVideoSSRC = 0;
		this.audioSSRC = 0;
		this.streamObj = null;
		this.switchFlag = false;
	}
	/*******************stream部分*********************/


	/*************************服务器连接部分***************************/
	starwebrtc.prototype.destroy = function () {
		this.emit("_remove_peer");
	}


	starwebrtc.prototype.resetStreamInfos = function (streamInfos) {
		this.streamInfos = [];
		for (var i = 0; i < 7; ++i) {
			var stream = new streamInfo();
			stream.bigVideoSSRC = 2312312300 + i;
			stream.smallVideoSSRC = 2312311300 + i;
			stream.audioSSRC = 2312310300 + i;
			stream.streamId = this.createRandomString(36);
			stream.cname = this.createRandomString(16);
			this.streamInfos.push(stream);
		}
	}

	//本地连接信道，信道为websocket
	starwebrtc.prototype.init = function () {

		this.resetStreamInfos();

		var that = this;

		this.on('_peers', function (data) {
			//获取所有服务器上的
			that.connections = data.connections;
			that.me = data.you;
			that.emit("get_peers", that.connections);
			//that.emit('connected', socket);
		});

		this.on('_remove_peer', function (data) {
			var sendId;
			that.closePeerConnection(that.starPeerConnection);
			//delete starPeerConnection;
			if (that.localMediaStream != null) {
				that.localMediaStream.getTracks().forEach(
					function (track) {
						track.stop();
					}
				);
				that.localMediaStream = null;
			}
			that.bigStreamId = "";
			that.smallStreamId = "";
			that.audioStreamId = "";

			that.bigSSRC = "";
			that.smallSSRC = "";

			that.audioSSRC = "";

			that.answerSDP = "";

			that.offerSDP = {};

			that.starPeerConnection = null;

			that.callback = null;

			that.serverIp = "0.0.0.0";
			that.serverPort = 80;

			that.resetStreamInfos();
		});

		this.on('_offer', function (data) {
			that.receiveOffer(data.socketId, data.sdp);
			that.emit("get_offer", data);
		});

		this.on('_answer', function (data) {
			var newSDP = data.sessionDesc;
			newSDP.type = "answer";
			newSDP.sdp = newSDP.sdp.replace(/actpass/g, "active");
			that.receiveAnswer(data.socketId, newSDP);
			that.emit('get_answer', data);
		});

		this.on('_webrtc_apply_ok', function (fingerprint, _streamAllsetCallback) {

			that.streamAllsetCallback = _streamAllsetCallback

			var candidateStr = "candidate:504457478 1 udp 2122260223 " + that.serverIp + " " + that.serverPort + " typ host generation 0 ufrag Nud3 network-id 1"
			var aSDP = sdpUtils.clone(that.offerSDP);
			that.createAnswerFromOffer3(aSDP, "Nud3", "SKuOCnwS3ScdasO5hD2aheqb",
				fingerprint,
				that.streamInfos,
				[candidateStr]);

			var newSdp = sdpUtils.genSdp(aSDP);
			var session_desc = {};
			session_desc.type = "offer";
			session_desc.sdp = newSdp
			that.starPeerConnection.setRemoteDescription(session_desc).then(
				function () {

					that.starPeerConnection.createAnswer(function (session_desc) {

						var sdpObj = sdpUtils.parseSdp(session_desc.sdp);
						that.filterSdpObj(sdpObj);

						that.replaceSSRC(sdpObj);

						var newSdp = sdpUtils.genSdp(sdpObj);
						session_desc.sdp = newSdp;

						that.starPeerConnection.setLocalDescription(session_desc).then(function () {
							that.callback({
								type: "applyAnswer",
								status: "success",
							});
						}, function (error) {
							console.log(error);
							that.callback({
								type: "applyAnswer",
								status: "failed",
							});
						});

					}, function (error) {
						console.log(error);
						that.callback({
							type: "applyAnswer",
							status: "failed",
						});
					});
				},
				function (error) {
					console.log(error);
					that.callback({
						type: "applyAnswer",
						status: "failed",
					});
				}
			);

			/* return;
			
			var candidateStr = "candidate:504457478 1 udp 2122260223 " + that.serverIp + " " + that.serverPort + " typ host generation 0 ufrag Nud3 network-id 1"
			var aSDP = sdpUtils.clone(that.offerSDP);
			that.createAnswerFromOffer3(aSDP, "Nud3", "SKuOCnwS3ScdasO5hD2aheqb",
													fingerprint, 
													that.streamInfos,
													[candidateStr]);
			var answerSDP = {};
			answerSDP.type = "answer";
			answerSDP.sdp = sdpUtils.genSdp(aSDP);
			
			
			that.streamAllsetCallback = _streamAllsetCallback
			
			that.receiveAnswer("xuaisi", answerSDP);
            that.emit('get_answer', answerSDP); */
		});

		this.on('ready', function (_callback, _bigOnly) {
			var bigOnly = _bigOnly || false;
			that.callback = _callback;
			that.createPeerConnections();
			that.addStreams(bigOnly);
			that.sendOffers();
		});
	};


	/*************************流处理部分*******************************/


	//创建本地流
	starwebrtc.prototype.createStream = function (options, callback) {
		var that = this;

		if (navigator.mediaDevices.getUserMedia) {

			this.numStreams++;

			navigator.mediaDevices.enumerateDevices()
				.then(function (deviceInfos) {
					var audioInput = false;
					var videoInput = false;
					for (var i = 0; i !== deviceInfos.length; ++i) {
						var deviceInfo = deviceInfos[i];
						//option.value = deviceInfo.deviceId;
						if (deviceInfo.kind === 'audioinput') {
							audioInput = true;
						} else if (deviceInfo.kind === 'audiooutput') {

						} else if (deviceInfo.kind === 'videoinput') {
							videoInput = true;
						} else {
							console.log('Some other kind of source/device: ', deviceInfo);
						}
					}
					return navigator.mediaDevices.getUserMedia(options);
				})
				.then(function (stream) {
					that.localMediaStream = stream;
					that.initializedStreams++;
					callback("success", stream);
				})
				.catch(function (e) {
					callback("failed", e);
				});


			/* navigator.mediaDevices.getUserMedia(options)
					.then(function(stream) {
                    that.localMediaStream = stream;
                    that.initializedStreams++;
					callback("success", stream);
                }).catch(function(e){
					callback("failed", e);
				}); */
		} else {
			callback("failed", new Error('WebRTC is not yet supported in this browser.'));
		}
	};

	//将本地流添加到所有的PeerConnection实例中
	starwebrtc.prototype.addStreams = function (bigOnly) {
		var i, m,
			stream,
			connection;

		var that = this;

		this.localMediaStream.getTracks().forEach(
			function (track) {

				that.starPeerConnection.addTrack(
					track,
					that.localMediaStream
				);

				that.tempPC.addTrack(
					track,
					that.localMediaStream
				);

				if (track.kind == "video") {
					that.bigStreamId = track.id;
					if (!bigOnly) {
						var smallVideo = track.clone();
						that.smallStreamId = smallVideo.id;
						smallVideo.applyConstraints({
							width: { ideal: 120 },
							height: { ideal: 90 },
							facingMode: { ideal: ["user"] }
						});

						that.starPeerConnection.addTrack(
							smallVideo,
							that.localMediaStream
						);
						that.tempPC.addTrack(
							smallVideo,
							that.localMediaStream
						);
					}

				}
				else if (track.kind == "audio") {
					that.audioStreamId = track.id;
				}
			}
		);
	};

	//将流绑定到video标签上用于输出
	starwebrtc.prototype.attachStream = function (stream, domId) {
		var element = document.getElementById(domId);
		element.srcObject = stream;
	};


	/***********************信令交换部分*******************************/

	starwebrtc.prototype.switchStream = function (stream) {
		var tracks = [];
		stream.getVideoTracks().forEach(function (track) {
			tracks.push(track);
			stream.removeTrack(track);
		});

		for (var i = tracks.length - 1; i >= 0; i--) {
			stream.addTrack(tracks[i]);
		}
	}

	starwebrtc.prototype.switchStreamInfo = function (streamInfo) {
		streamInfo.switchFlag = !streamInfo.switchFlag;
		this.switchStream(streamInfo.streamObj);
	}

	starwebrtc.prototype.resetStreamInfo = function (streamInfo) {
		if (streamInfo.switchFlag) {
			this.switchStreamInfo(streamInfo);
		}
	}

	starwebrtc.prototype.switchStreams = function () {
		for (var i in this.streamInfos) {
			this.switchStreamInfo(this.streamInfos[i]);
		}
	};

	starwebrtc.prototype.getStreamByIndex = function (index) {
		return this.streamInfos[index];
	}

	starwebrtc.prototype.getStreamInfos = function (index) {
		return this.streamInfos;
	}

	starwebrtc.prototype.onAddStream = function (streamObj) {
		var allSet = true;
		for (var i in this.streamInfos) {
			var stream = this.streamInfos[i];
			if (stream.streamId == streamObj.id) {
				stream.streamObj = streamObj;
			}
			if (stream.streamObj == null) {
				allSet = false;
			}
		}
		if (allSet && this.streamAllsetCallback != null && this.starPeerConnection.iceConnectionState == "connected") {
			this.streamAllsetCallback();
			this.streamAllsetCallback = null;
		}
	}

	starwebrtc.prototype.setServerInfo = function (info) {
		this.serverIp = info.serverIp;
		this.serverPort = info.serverPort;
	};

	starwebrtc.prototype.createRandomString = function (length) {
		var kBase64 = [
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
			'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
			'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
			'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

		var genStr = "";

		for (var i = 0; i < length; ++i) {
			genStr += kBase64[Math.floor((Math.random() * kBase64.length))];
		}

		return genStr;
	};


	starwebrtc.prototype.uuid = function () {

		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		function NewGuid() {
			return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
		}

		return NewGuid();
	}

	starwebrtc.prototype.replaceSSRC = function (sdpObj) {
		for (var i in sdpObj.mediaDesc) {
			var mediaObj = sdpObj.mediaDesc[i];
			if (mediaObj.type == "audio") {
				if (this.audioStreamId != "" && mediaObj.msid.indexOf(this.audioStreamId) != -1) {
					var ssrcObj = mediaObj.ssrcInfoArray[0];
					mediaObj.ssrcInfoArray = [];
					mediaObj.ssrcInfoMap = {};
					ssrcObj.ssrc = this.ssrcData.audioSSRC;
					mediaObj.ssrcInfoArray.push(ssrcObj);
					mediaObj.ssrcInfoMap[ssrcObj.ssrc] = ssrcObj;
				}
			}
			else if (mediaObj.type == "video") {
				if (this.smallStreamId != "" && mediaObj.msid.indexOf(this.smallStreamId) != -1) {
					var ssrcObj = mediaObj.ssrcInfoArray[0];
					mediaObj.ssrcInfoArray = [];
					mediaObj.ssrcInfoMap = {};
					ssrcObj.ssrc = this.ssrcData.smallVideoSSRC;
					mediaObj.ssrcInfoArray.push(ssrcObj);
					mediaObj.ssrcInfoMap[ssrcObj.ssrc] = ssrcObj;
				}
				else if (this.bigStreamId != "" && mediaObj.msid.indexOf(this.bigStreamId) != -1) {
					var ssrcObj = mediaObj.ssrcInfoArray[0];
					mediaObj.ssrcInfoArray = [];
					mediaObj.ssrcInfoMap = {};
					ssrcObj.ssrc = this.ssrcData.bigVideoSSRC;
					mediaObj.ssrcInfoArray.push(ssrcObj);
					mediaObj.ssrcInfoMap[ssrcObj.ssrc] = ssrcObj;
				}
			}
		}
	}

	starwebrtc.prototype.filterSdpObj = function (sdpObj) {
		for (var i in sdpObj.mediaDesc) {
			var mediaObj = sdpObj.mediaDesc[i];
			mediaObj.extmap = {};
			mediaObj.ssrcGroup = [];
			mediaObj.codecInfoMap = {};
			var newCodecArray = [];
			for (var i in mediaObj.codecInfoArray) {
				var codec = mediaObj.codecInfoArray[i];
				if (mediaObj.type == "audio") {
					if (codec.codecName == "opus") {
						newCodecArray.push(codec);
						mediaObj.codecInfoMap[codec.playload] = codec;
					}
				}
				else if (mediaObj.type == "video") {
					if (codec.codecName == "H264") {
						if (newCodecArray.length == 0) {
							newCodecArray.push(codec);
							mediaObj.codecInfoMap[codec.playload] = codec;
						}
					}
				}
			}
			mediaObj.codecInfoArray = newCodecArray;

			var newSSRCInfoMap = {};
			var newSSRCInfoArray = [];
			var temp = {};
			for (var i in mediaObj.ssrcInfoArray) {
				var ssrcInfo = mediaObj.ssrcInfoArray[i];
				if (temp[ssrcInfo.label] == undefined) {
					temp[ssrcInfo.label] = 1;
					newSSRCInfoMap[ssrcInfo.ssrc] = ssrcInfo;
					newSSRCInfoArray.push(ssrcInfo);
				}
			}
			mediaObj.ssrcInfoArray = newSSRCInfoArray;
			mediaObj.ssrcInfoMap = newSSRCInfoMap;
		}
	}

	starwebrtc.prototype.getSSRCData = function (sdpDescObj, streamIdDes) {
		var ssrcData = {
			"audioSSRC": "",
			"smallVideoSSRC": "",
			"bigVideoSSRC": "",
			"audioCodec": "",
			"videoCodec": ""
		};

		for (var i in sdpDescObj.mediaDesc) {
			var mediaObj = sdpDescObj.mediaDesc[i];
			if (mediaObj.type == "audio") {
				for (var key in mediaObj.ssrcInfoMap) {
					var ssrcInfo = mediaObj.ssrcInfoMap[key];
					ssrcData.audioSSRC = ssrcInfo.ssrc;
				}
				ssrcData.audioCodec = mediaObj.codecInfoArray[0].playload;
			}
			else if (mediaObj.type == "video") {
				for (var key in mediaObj.ssrcInfoMap) {
					var ssrcInfo = mediaObj.ssrcInfoMap[key];
					if (streamIdDes.bigStreamId != "") {
						if (ssrcInfo.label.length == 0) {
							if (mediaObj.msid.indexOf(streamIdDes.bigStreamId) != -1) {
								ssrcData.bigVideoSSRC = ssrcInfo.ssrc;
							}
						}
						else if (ssrcInfo.label.indexOf(streamIdDes.bigStreamId) != -1) {
							ssrcData.bigVideoSSRC = ssrcInfo.ssrc;
						}
					}
					if (streamIdDes.smallStreamId != "") {
						if (ssrcInfo.label.length == 0) {
							if (mediaObj.msid.indexOf(streamIdDes.smallStreamId) != -1) {
								ssrcData.smallVideoSSRC = ssrcInfo.ssrc;
							}
						}
						else if (ssrcInfo.label.indexOf(streamIdDes.smallStreamId) != -1) {
							ssrcData.smallVideoSSRC = ssrcInfo.ssrc;
						}
					}
				}
				ssrcData.videoCodec = mediaObj.codecInfoArray[0].playload;
			}
		}

		return ssrcData;
	}

	starwebrtc.prototype.createAnswerFromOffer3 = function (sdpObj, iceUfrag, icePassword, fingerprint, streamInfos, candidate) {
		if (sdpObj.iceInfo.iceUfrag != undefined) {
			sdpObj.iceInfo.iceUfrag = iceUfrag;
		}
		if (sdpObj.iceInfo.icePwd != undefined) {
			sdpObj.iceInfo.icePwd = icePassword;
		}
		if (sdpObj.fingerprintInfo.algorithm != undefined) {
			sdpObj.fingerprintInfo.value = fingerprint;
		}
		var audio = false;
		var video = false;
		var tmpMediaDesc = [];
		for (var i in sdpObj.mediaDesc) {
			var mediaObj = sdpObj.mediaDesc[i];
			mediaObj.setup = "actpass";
			if (mediaObj.iceInfo.iceUfrag != "") {
				mediaObj.iceInfo.iceUfrag = iceUfrag;
			}
			if (mediaObj.iceInfo.icePwd != "") {
				mediaObj.iceInfo.icePwd = icePassword;
			}
			if (mediaObj.fingerprintInfo.algorithm != "") {
				mediaObj.fingerprintInfo.value = fingerprint;
			}
			mediaObj.candidate = candidate;
			mediaObj.ssrcInfoMap = {};
			mediaObj.ssrcInfoArray = [];
			mediaObj.ssrcGroup = [];
			mediaObj.msid = "";

			if (mediaObj.type == "audio" && !audio) {
				audio = true;
				for (var j in streamInfos) {
					var audioM = sdpUtils.clone(mediaObj);
					audioM.mid = mediaObj.type + "_" + i + "_" + j;
					var aSSRC = {};
					aSSRC.ssrc = streamInfos[j].audioSSRC;
					aSSRC.cname = streamInfos[j].cname;
					aSSRC.mslabel = streamInfos[j].streamId;
					aSSRC.label = this.uuid();
					aSSRC.msid = aSSRC.mslabel + " " + aSSRC.label;
					audioM.ssrcInfoMap[aSSRC.ssrc] = aSSRC;
					audioM.ssrcInfoArray.push(aSSRC);
					audioM.msid = aSSRC.mslabel + " " + aSSRC.label;
					tmpMediaDesc.push(audioM);
				}

			}
			else if (mediaObj.type == "video" && !video) {
				video = true;
				for (var j in streamInfos) {
					if (streamInfos[j].smallVideoSSRC != 0) {
						var videoM = sdpUtils.clone(mediaObj);
						videoM.mid = mediaObj.type + "_s" + i + "_" + j;
						var vSSRC = {};
						vSSRC.ssrc = streamInfos[j].smallVideoSSRC;
						vSSRC.cname = streamInfos[j].cname;;
						vSSRC.mslabel = streamInfos[j].streamId;
						vSSRC.label = this.uuid();
						vSSRC.msid = vSSRC.mslabel + " " + vSSRC.label;
						videoM.ssrcInfoMap[vSSRC.ssrc] = vSSRC;
						videoM.ssrcInfoArray.push(vSSRC);
						videoM.msid = vSSRC.mslabel + " " + vSSRC.label;
						tmpMediaDesc.push(videoM);
					}
					if (streamInfos[j].bigVideoSSRC != 0) {
						var videoM = sdpUtils.clone(mediaObj);
						videoM.mid = mediaObj.type + "_b" + i + "_" + j;
						var vSSRC = {};
						vSSRC.ssrc = streamInfos[j].bigVideoSSRC;
						vSSRC.cname = streamInfos[j].cname;
						vSSRC.mslabel = streamInfos[j].streamId;
						vSSRC.label = this.uuid();
						vSSRC.msid = vSSRC.mslabel + " " + vSSRC.label;
						videoM.ssrcInfoMap[vSSRC.ssrc] = vSSRC;
						videoM.msid = vSSRC.mslabel + " " + vSSRC.label;
						videoM.ssrcInfoArray.push(vSSRC);
						tmpMediaDesc.push(videoM);
					}
				}
			}
		}
		sdpObj.mediaDesc = tmpMediaDesc;
	}

	//向所有PeerConnection发送Offer类型信令
	starwebrtc.prototype.sendOffers = function () {
		var i, m,
			pc,
			that = this,
			pcCreateOfferCbGen = function (pc, _callback) {
				return function (session_desc) {
					{

						var sdpObj = sdpUtils.parseSdp(session_desc.sdp);
						that.filterSdpObj(sdpObj);

						var newSdp = sdpUtils.genSdp(sdpObj);

						that.offerSDP = sdpObj;
						session_desc.sdp = newSdp;

						var ssrcData = that.getSSRCData(sdpObj, { "bigStreamId": that.bigStreamId, "smallStreamId": that.smallStreamId });
						that.ssrcData = ssrcData;

						that.tempPC.close();
						delete that.tempPC;
						that.tempPC = null;

						_callback({
							type: "createOffer",
							status: "success",
							audioSSRC: ssrcData.audioSSRC,
							smallVideoSSRC: ssrcData.smallVideoSSRC,
							bigVideoSSRC: ssrcData.bigVideoSSRC,
							videoCodec: ssrcData.videoCodec,
							audioCodec: ssrcData.audioCodec
						});

					}
					/* pc.setLocalDescription(session_desc).then(
		function() {
			_callback({
				type:"createOffer",
				status:"success",
				audioSSRC:ssrcData.audioSSRC,
				smallVideoSSRC:ssrcData.smallVideoSSRC,
				bigVideoSSRC:ssrcData.bigVideoSSRC,
			});
		},
		function(error) {
			 _callback({
				type:"createOffer",
				status:"failed",
				audioSSRC:ssrcData.audioSSRC,
				smallVideoSSRC:ssrcData.smallVideoSSRC,
				bigVideoSSRC:ssrcData.bigVideoSSRC,
			});
		}
		); */


				};
			},
			pcCreateOfferErrorCb = function (error) {
				console.log(error);
				that.callback({
					type: "createOffer",
					status: "failed",
				});
			};

		//pc = this.starPeerConnection;
		pc = this.tempPC;
		pc.createOffer(pcCreateOfferCbGen(this.starPeerConnection, this.callback), pcCreateOfferErrorCb);
	};

	//接收到Offer类型信令后作为回应返回answer类型信令
	starwebrtc.prototype.receiveOffer = function (socketId, sdp) {
		var pc = this.starPeerConnection;
		this.sendAnswer(socketId, sdp);
	};

	//发送answer类型信令
	starwebrtc.prototype.sendAnswer = function (socketId, sdp) {
		var pc = this.starPeerConnection;
		var that = this;
		pc.setRemoteDescription(new nativeRTCSessionDescription(sdp));
		pc.createAnswer(function (session_desc) {
			{
				//var newSdp = that.changeSdp(session_desc.sdp);
				//session_desc.sdp = newSdp;
			}
			pc.setLocalDescription(session_desc);
			that.socket.send(JSON.stringify({
				"eventName": "__answer",
				"data": {
					"socketId": socketId,
					"sdp": session_desc
				}
			}));
		}, function (error) {
			console.log(error);
		});
	};

	//接收到answer类型信令后将对方的session描述写入PeerConnection中
	starwebrtc.prototype.receiveAnswer = function (socketId, sdp) {
		var pc = this.starPeerConnection;
		var that = this;
		pc.setRemoteDescription(new nativeRTCSessionDescription(sdp)).then(
			function () {
				that.callback({
					type: "applyAnswer",
					status: "success",
				});
			},
			function (error) {
				that.callback({
					type: "applyAnswer",
					status: "failed",
				});
			}
		);;

	};

	starwebrtc.prototype.startLocalStream = function (dom) {
		dom.srcObject = this.localMediaStream;
	}


	/***********************点对点连接部分*****************************/


	//创建与其他用户连接的PeerConnections
	starwebrtc.prototype.createPeerConnections = function () {
		var i, m;
		this.createPeerConnection("xuaisi");
	};

	//创建单个PeerConnection
	starwebrtc.prototype.createPeerConnection = function (socketId) {
		var that = this;
		var pc = new PeerConnection(iceServer);
		this.starPeerConnection = pc;
		this.tempPC = new PeerConnection(iceServer);
		pc.onicecandidate = function (evt) {

		};

		pc.oniceconnectionstatechange = function (evt) {
			if (pc.iceConnectionState === "connected") {
				if (that.streamAllsetCallback != null) {
					that.streamAllsetCallback();
					that.streamAllsetCallback = null;
				}
			}
		}

		/* pc.ontrack = function(evt)
		{
			that.onAddTrack(evt.streams[0], evt.track);
		} */

		pc.onopen = function () {
			that.emit("pc_opened", socketId, pc);
		};

		pc.onaddstream = function (evt) {
			that.onAddStream(evt.stream);
		};

		pc.ondatachannel = function (evt) {

		};
		return pc;
	};

	//关闭PeerConnection连接
	starwebrtc.prototype.closePeerConnection = function (pc) {
		if (!pc) return;
		pc.close();
	};


	/***********************数据通道连接部分*****************************/


	//消息广播
	starwebrtc.prototype.broadcast = function (message) {
		var socketId;
		for (socketId in this.dataChannels) {
			this.sendMessage(message, socketId);
		}
	};

	//发送消息方法
	starwebrtc.prototype.sendMessage = function (message, socketId) {
		if (this.dataChannels[socketId].readyState.toLowerCase() === 'open') {
			this.dataChannels[socketId].send(JSON.stringify({
				type: "__msg",
				data: message
			}));
		}
	};

	//对所有的PeerConnections创建Data channel
	starwebrtc.prototype.addDataChannels = function () {
		var connection;
		for (connection in this.peerConnections) {
			this.createDataChannel(connection);
		}
	};

	//对某一个PeerConnection创建Data channel
	starwebrtc.prototype.createDataChannel = function (socketId, label) {
		var pc, key, channel;
		pc = this.peerConnections[socketId];

		if (!socketId) {
			this.emit("data_channel_create_error", socketId, new Error("attempt to create data channel without socket id"));
		}

		if (!(pc instanceof PeerConnection)) {
			this.emit("data_channel_create_error", socketId, new Error("attempt to create data channel without peerConnection"));
		}
		try {
			channel = pc.createDataChannel(label);
		} catch (error) {
			this.emit("data_channel_create_error", socketId, error);
		}

		return this.addDataChannel(socketId, channel);
	};

	//为Data channel绑定相应的事件回调函数
	starwebrtc.prototype.addDataChannel = function (socketId, channel) {
		var that = this;
		channel.onopen = function () {
			that.emit('data_channel_opened', channel, socketId);
		};

		channel.onclose = function (event) {
			delete that.dataChannels[socketId];
			that.emit('data_channel_closed', channel, socketId);
		};

		channel.onmessage = function (message) {
			var json;
			json = JSON.parse(message.data);
			if (json.type === '__file') {
				/*that.receiveFileChunk(json);*/
				that.parseFilePacket(json, socketId);
			} else {
				that.emit('data_channel_message', channel, socketId, json.data);
			}
		};

		channel.onerror = function (err) {
			that.emit('data_channel_error', channel, socketId, err);
		};

		this.dataChannels[socketId] = channel;
		return channel;
	};

	return new starwebrtc();
};

module.exports = exports = StarWebRTC;