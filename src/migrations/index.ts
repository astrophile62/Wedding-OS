import * as migration_20261101_141216_initial from './20261101_141216_initial';
import * as migration_20261104_053242_music from './20261104_053242_music';

export const migrations = [
  {
    up: migration_20261101_141216_initial.up,
    down: migration_20261101_141216_initial.down,
    name: '20261101_141216_initial',
  },
  {
    up: migration_20261104_053242_music.up,
    down: migration_20261104_053242_music.down,
    name: '20261104_053242_music'
  },
];
