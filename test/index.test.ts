import { readFileSync } from 'fs';
import { resolve, normalize } from 'path';
import { EntryGenerator } from '../src/index';

describe('/test/index.test.ts', () => {
  it('generate index', async () => {
    const baseUrl = resolve(__dirname, './fixtures/base-app');
    const generator = new EntryGenerator({
      baseUrl,
    });
    generator.run();
    expect(
      readFileSync(resolve(baseUrl, 'src/index.ts')).toString()
    ).toMatchSnapshot();
  });

  it('get export info collection', () => {
    new Array(3).fill('').forEach((_, i) => {
      const baseUrl = resolve(__dirname, `./fixtures/case${i + 1}`);
      const generator = new EntryGenerator({
        baseUrl,
        rootDir: '.',
      });
      const collection = generator.collect();

      expect(collection.configurationClz).toEqual('ContainerLifeCycle');

      expect(normalize(collection.configurationFilepath)).toEqual(
        resolve(baseUrl, 'file.ts')
      );
    });
  });
});
