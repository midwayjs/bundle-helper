import { join } from 'path';
import { EntryGenerator, getConfigurationClassName } from '../src/index';
import { readFileSync } from 'fs';

describe('/test/index.test.ts', () => {
  it('generate index', async () => {
    const baseDir = join(__dirname, './fixtures/base-app');
    const generator = new EntryGenerator();
    await generator.run({
      baseDir,
    });
    expect(readFileSync(join(baseDir, 'src/index.ts')).toString()).toMatchSnapshot();
  });

  it('get configuration class name', () => {
    expect(getConfigurationClassName(readFileSync(join(__dirname, './fixtures/case/file1.ts')).toString())).toEqual('ContainerLifeCycle');
    expect(getConfigurationClassName(readFileSync(join(__dirname, './fixtures/case/file2.ts')).toString())).toEqual('ContainerLifeCycle');
  });
});