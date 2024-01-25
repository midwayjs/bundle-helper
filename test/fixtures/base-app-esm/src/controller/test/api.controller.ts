import { Inject, Controller, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Get('/get_user')
  async getUser() {
    return 'bbb';
  }
}
