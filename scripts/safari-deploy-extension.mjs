import 'zx/globals';
import { rootDir } from './helpers/dirs.mjs';

cd(`${rootDir}/safari-web-extension/Vocably`);
await $`bundle exec fastlane mac beta`;
