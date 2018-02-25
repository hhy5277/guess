import { parse } from './ng/index';
import { dbStorage } from './store/store';
import * as minimist from 'minimist';
import chalk from 'chalk';

import { fetch } from './fetch';
import { listen } from './report';

const argv = minimist(process.argv);

const o = (n: string) => chalk.yellow(n);
const c = (n: string) => chalk.blue(n);
const d = (n: string) => chalk.gray(n);
const error = (s: string) => {
  console.error(chalk.red(s));
  process.exit(1);
};

if (argv.h) {
  console.log(`
Welcome to Smarty!

${c('fetch')} ${o('-v')} ${o('[view_id]')} ${o('-c')} ${o('[credentials]')} ${o('-s')} ${o('[start_date]')} ${o(
    '-e'
  )} ${o('[end_date]')} ${o('-a')} ${o('[aggregate]')} ${o('-p')} ${o(
    '[project_path]'
  )} ${d(`Fetches data from Google Analytics and stores it in levelgraph.
  Provide the view id of your page and credentials JSON file.`)}
${chalk.blue('report')} ${o('-p')} ${o('[port]')} ${d(
    `Starts a server which lets you explore the flow for given view.`
  )}
${chalk.blue('ng-routes')} ${o('-p')} ${o('[tsconfig]')} ${d(`Collects the routes of an Angular application.`)}
`);
  process.exit(0);
}

const isFetch = argv._.indexOf('fetch') >= 0;
const isReport = argv._.indexOf('report') >= 0;
const ngRoutes = argv._.indexOf('ng-routes') >= 0;

[isFetch, isReport, ngRoutes].reduce((a, c) => {
  if (a && c) {
    error('You can specify only "report", "fetch", or "ng-routes" in the same time');
  }
  return a || c;
}, false);

if (isFetch) {
  const key = require(argv.c);
  const viewId = argv.v;
  const start = argv.s;
  const end = argv.e;

  if (!viewId) {
    error('View id is mandatory');
  }

  if (!start || !end) {
    error('Start and end dates are mandatory');
  }

  if (argv.a && !argv.p) {
    error('For aggregated information you should provide a project as well');
  }

  fetch(
    key,
    viewId,
    {
      startDate: new Date(start),
      endDate: new Date(end)
    },
    r => r.replace('/app', ''),
    argv.a ? parse(argv.p) : []
  ).then(
    () => {
      console.log(chalk.green('Data processed successfully'));
    },
    e => {
      error(chalk.red(e));
    }
  );
}

if (isReport) {
  listen(argv.p || 3000);
}
