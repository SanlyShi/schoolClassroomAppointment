# 基础镜像
FROM tuno8ayk.mirror.aliyuncs.com/library/node:12

# 创建工作目录
WORKDIR /usr/src/app
COPY . /usr/src/app

# 使用阿里cnpm提高npm速度
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install

RUN npm run build:prod
RUN ls

# 容器时间同步
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone

# 容器启动命令
CMD [ "node", "app.js" ]

