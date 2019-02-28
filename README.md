# 在线教育示例程序

在线体验地址：https://www.starrtc.com/demo/edu

用户名和密码随便输入即可。

注：需要电脑有摄像头。

有问题请加QQ群讨论：807242783

更多示例请参见：https://docs.starrtc.com/en/download/

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