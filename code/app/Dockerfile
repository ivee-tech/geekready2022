FROM node:16 as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
# install app dependencies
COPY package.json ./
RUN npm install

# add app
COPY . ./

RUN npm run build


FROM node:lts-alpine as final

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

COPY --from=build /app/dist/. .

EXPOSE 2999
CMD [ "http-server", ".", "-p", "2999" ]