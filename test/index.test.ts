import { readFileSync } from 'fs';
import { resolve, normalize } from 'path';
import { EntryGenerator } from '../src/index';

function validate(baseUrl) {
  const generator = new EntryGenerator({
    baseUrl,
    rootDir: '.',
  });
  const collection = generator.collect();

  expect(collection.configurationClz).toEqual('ContainerLifeCycle');

  expect(normalize(collection.configurationFilepath as string)).toEqual(
    resolve(baseUrl, 'file.ts')
  );
}

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

  describe('test case', () => {
    it('case 1', () => {
      validate(resolve(__dirname, `./fixtures/case1`));
    });

    it('case 2', () => {
      validate(resolve(__dirname, `./fixtures/case2`));
    });

    it('case 3', () => {
      validate(resolve(__dirname, `./fixtures/case3`));
    });

    it('case 4', () => {
      validate(resolve(__dirname, `./fixtures/case4`));
    });
  });

  it('fix issue11', async () => {
    const baseUrl = resolve(__dirname, './fixtures/issue11');
    const generator = new EntryGenerator({
      baseUrl,
    });
    generator.run();
    expect(
      readFileSync(resolve(baseUrl, 'src/index.ts')).toString()
    ).toMatchSnapshot();
  });

  it('support esm project', async () => {
    const baseUrl = resolve(__dirname, './fixtures/base-app-esm');
    const generator = new EntryGenerator({
      baseUrl,
    });
    generator.run();
    expect(
      readFileSync(resolve(baseUrl, 'src/index.ts')).toString()
    ).toMatchSnapshot();
  });
});
