import { Controller, Get } from '@midwayjs/decorator';

@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'home value';
  }

  @Get('/login')
  async login(): Promise<string> {
    return 'login page'
  }
}
