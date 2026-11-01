import * as migration_20261101_141216_initial from './20261101_141216_initial';

export const migrations = [
  {
    up: migration_20261101_141216_initial.up,
    down: migration_20261101_141216_initial.down,
    name: '20261101_141216_initial'
  },
];
