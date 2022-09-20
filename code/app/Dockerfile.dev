# specify the node base image with your desired version node:<version>
FROM node:14

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
# install app dependencies
COPY package.json ./
RUN npm install

# add app
COPY . ./

# run unit tests
RUN npm run unit-test-ci

RUN chmod u=r .
EXPOSE 2999

USER 1024

# start app
ENTRYPOINT [ "npm", "start" ]
