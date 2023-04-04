import { Configuration, App, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';
import { join } from 'path';
import * as session from 'koa-session';
import * as axios from '@midwayjs/axios';
import { ILifeCycle } from '@midwayjs/core';
import { Table, Model, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

@Table
export class Player extends Model {
  @Column
  name: string;

  @Column
  num: number;

  @ForeignKey(() => Team)
  @Column
  teamId: number;

  @BelongsTo(() => Team)
  team: Team;
}

@Table
export class Team extends Model {
  @Column
  name: string;

  @HasMany(() => Player)
  players: Player[];
}

@Configuration({
  imports: [koa, axios],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle{
  @App()
  app: koa.Application;

  @Inject()
  httpService: axios.HttpService;

  async onReady() {
    this.app.keys = ['default value'];
    this.app.use(session({ key: 'SESSIONID' }, this.app));
    // bodyparser options see https://github.com/koajs/bodyparser
    this.app.useMiddleware([bodyParser()]);

    return await this.httpService.get(
      'http://www.weather.com.cn/data/cityinfo/101010100.html'
    );
  }
}

export class bbb {
  @App()
  app: koa.Application;

  @Inject()
  httpService: axios.HttpService;

  async onReady() {
    this.app.keys = ['default value'];
    this.app.use(session({ key: 'SESSIONID' }, this.app));
    // bodyparser options see https://github.com/koajs/bodyparser
    this.app.useMiddleware([bodyParser()]);

    return await this.httpService.get(
      'http://www.weather.com.cn/data/cityinfo/101010100.html'
    );
  }
}
