import { Configuration, App, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';
import { join } from 'path';
import * as session from 'koa-session';
import * as axios from '@midwayjs/axios';

@Configuration({
  imports: [
    koa,
    axios,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  @Inject()
  httpService: axios.HttpService;

  async onReady() {
    this.app.keys = ['default value'];
    this.app.use(session({key: "SESSIONID"}, this.app))
    // bodyparser options see https://github.com/koajs/bodyparser
    this.app.useMiddleware([bodyParser()]);
    
    return await this.httpService.get('http://www.weather.com.cn/data/cityinfo/101010100.html');
  }
}
