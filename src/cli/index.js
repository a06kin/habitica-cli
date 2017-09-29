import colors from 'colors/safe';
import * as tasks from '../tasks';
import * as user from '../user';
import * as rewards from '../rewards';
import * as format from '../format';
import {
  log,
  setLogger,
} from '../utils';
import * as score from './score';
import * as create from './create';
import * as destroy from './destroy';

const vorpal = require('vorpal');

const TYPES = tasks.TYPES;
const cli = vorpal();

cli.command('status', 'List your stats.')
  .alias('stats')
  .action(async (args, callback) => {
    const stats = await user.stats();
    log(format.stats(stats));
    callback();
  });

cli.command('habits list', 'List your habits.')
  .alias('habits')
  .alias('h')
  .action(async (args, callback) => {
    const habits = await tasks.getTasks({
      type: TYPES.HABITS,
    });

    log(format.tasks(habits, 'all'));

    callback();
  });

cli.command('habits score [ids...]', 'Score one or multiple habits.')
  .alias('hs')
  .option('-d, --down', 'Score a habit down.')
  .action(score.habits);

cli.command('habits add', 'Create a new habit.')
  .alias('new habit')
  .alias('ha')
  .action(create.habit);

cli.command('habits delete [ids...]', 'Delete habits.')
  .alias('habit delete')
  .alias('destroy habit')
  .alias('destroy habits')
  .alias('hd')
  .action(destroy.habits);

cli.command('dailies list', 'List your dailies.')
  .alias('dailies')
  .alias('d')
  .option('-f, --filter [filter]', 'List filter type (all | due | grey).', ['due', 'all', 'grey'])
  .action(async (args, callback) => {
    const dailies = await tasks.getTasks({
      type: TYPES.DAILIES,
    });

    log(format.tasks(dailies, args.options.filter));

    callback();
  });

cli.command('dailies complete [ids...]', 'Complete one or multiple dailies.')
  .alias('dailies score')
  .alias('dc')
  .alias('ds')
  .option('-d, --down', 'Undo a complete action on a task.')
  .action(score.dailies);

cli.command('dailies add', 'Create a new habit.')
  .alias('new dailies')
  .alias('new daily')
  .alias('da')
  .action(create.daily);

cli.command('dailies delete [ids...]', 'Delete dailies.')
  .alias('daily delete')
  .alias('destroy dailies')
  .alias('destroy daily')
  .alias('dd')
  .action(destroy.dailies);

cli.command('todos list', 'List your todos.')
  .alias('todos')
  .alias('t')
  .option('-f, --filter [filter]', 'List filter type (all | dated | completed).', ['all', 'dated', 'completed'])
  .action(async (args, callback) => {
    const filter = args.options.filter || 'dated';
    const todos = await tasks.getTodos({ filter });
    log(format.tasks(todos, filter));
    callback();
  });

cli.command('todos add', 'Create a new task.')
  .alias('new todo')
  .alias('ta')
  .option('-m, --message [message]', 'Use the given [message] as todo title and skip the prompt.')
  .action(create.todo);

cli.command('todos complete [ids...]', 'Score one or multiple habits.')
  .alias('todos score')
  .alias('tc')
  .alias('ts')
  .option('-u, --undo', 'Uncomplete a todo.')
  .option('-d, --down', 'Uncomplete a todo. (alias)')
  .action(score.todos);

cli.command('todos delete [ids...]', 'Delete todos.')
  .alias('todo delete')
  .alias('destroy todos')
  .alias('destroy todo')
  .alias('td')
  .action(destroy.todos);

cli.command('shop', 'List available rewards for purchase.')
  .action(async (args, callback) => {
    const [items, stats] = await Promise.all([
      rewards.getBuyItems(),
      user.stats(),
    ]);
    log(format.rewards(items));
    const gold = Math.floor(stats.gold);
    const silver = (stats.gold - gold) * 100;
    log(`  You have ${colors.yellow(gold.toFixed(0))}${colors.yellow(' GP')} and ${colors.grey(silver.toFixed(0))}${colors.grey(' silver')}.\n`);
    callback();
  });

cli.command('buy [itemName...]', 'Buy a reward by name.')
  .action(async (args, callback) => {
    const shortId = args.itemName.join(' ');
    try {
      const message = await rewards.buyGear({ shortId });
      log(message);
    } catch (e) {
      log(e.message);
    }

    callback();
  });

cli.command('quest', 'List current quest details.')
  .action(async (args, callback) => {
    const questDetails = await user.quest();
    log(format.quest(questDetails));
    callback();
  });

cli.command('sync', 'Runs cron.')
  .alias('cron')
  .action(async (args, callback) => {
    await user.cron();
    log('Success!');
    callback();
  });

export default async function run() {
  setLogger(cli.log.bind(cli));
  const [stats] = await Promise.all([
    user.stats(),
    user.cron(),
  ]);
  log(`Welcome back ${stats.userName}!`);
  cli.delimiter('habitica $ ')
    .history('habitica-cli')
    .show();
}
