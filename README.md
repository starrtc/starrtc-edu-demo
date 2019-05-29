# 在线教育示例程序

在线体验地址：https://www.starrtc.com/demo/edu

用户名和密码随便输入即可。注：需要电脑有摄像头。


本产品完全免费，并且提供免费的私有部署服务端程序，支持全部功能，并提供第三方拉流、推流功能。

需要我们支持请加QQ群： 807242783

如需私有部署，请到如下地址下载：

https://github.com/starrtc/starrtc-server

更多示例请参见：https://docs.starrtc.com/en/download/


在线教育
==
pdf文档上传标记直播，白板

![edu_pdf](assets/edu_pdf.jpg)

![edu_whiteboard](assets/edu_whiteboard.jpg)

录屏
==

![screen_phone](assets/screen_phone.jpg)

![screen_web](assets/screen_web.jpg)



# 编译
```java
 git clone https://github.com/starrtc/starrtc-edu-demo.git
 cd starrtc-edu-demo
 npm install
 npm run build
 编译后生成的文件在build目录，将build目录里面的文件放在网站根目录下即可：
 
 1，假设网站根目录为/opt/nginx/html/starrtc_demo/ 
 2，cd starrtc-edu-demo/build
 3，mv * /opt/nginx/html/starrtc_demo/
 4，需要配置域名指向starrtc_demo目录
```