/*
 *  ontime: a human-readable cron
 */

import nextime from './lib/nextime.js';
import fmt from './lib/fmt.js';

let idcnt = 0;

function log(id, enabled) {
  let r;

  if (!enabled) {
    r = () => {};
    r.cycleString = () => '';
    r.timeString = () => '';

    return r;
  }

  r = (msg) => console.log(`[ontime] ${id}: ${msg}`);
  r.cycleString = (cycle) => {
    const t = {
      '': 'on speicifed times',
      's': 'every second',
      'm': 'every minute',
      'h': 'hourly',
      'w': 'weekly',
      'D': 'daily',
      'M': 'monthly',
      'Y': 'yearly',
    };

    return t[cycle];
  };
  r.timeString = (ms) => {
    ms /= 1000;
    if (ms / (60 * 60 * 24 * 365) >= 1) return `${Math.floor(ms / (60 * 60 * 24 * 365))} year(s)`;
    if (ms / (60 * 60 * 24 * 30) >= 1) return `${Math.floor(ms / (60 * 60 * 24 * 30))} month(s)`;
    if (ms / (60 * 60 * 24 * 7) >= 1) return `${Math.floor(ms / (60 * 60 * 24 * 7))} week(s)`;
    if (ms / (60 * 60 * 24) >= 1) return `${Math.floor(ms / (60 * 60 * 24))} day(s)`;
    if (ms / (60 * 60) >= 1) return `${Math.floor(ms / (60 * 60))} hour(s)`;
    if (ms / 60 >= 1) return `${Math.floor(ms / 60)} min(s)`;
    return `${Math.floor(ms)} sec(s)`;
  };

  return r;
}

function exTimeout(job, time) {
  const max = 0x7fffffff;

  if (time > max) return setTimeout(() => exTimeout(job, time - max), max);
  return setTimeout(job, time);
}

function convWeekly(days) {
  function dayNumber(days, i, time) {
    switch (days[i].toLowerCase().substring(0, 3)) {
      case 'sun':
        return 0;
      case 'mon':
        return 1;
      case 'tue':
        return 2;
      case 'wed':
        return 3;
      case 'thu':
        return 4;
      case 'fri':
        return 5;
      case 'sat':
        return 6;
      case 'wee':
        if (days[i][4] === 'd') { // weekday
          days.splice(
            ...[i, 1].concat(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => `${d} ${time}`)),
          );
          return 1;
        } else { // weekend
          days.splice(
            ...[i, 1].concat(['Sat', 'Sun'].map((d) => `${d} ${time}`)),
          );
          return 6;
        }
    }
    return 0;
  }

  days = days || [];
  if (typeof days === 'string') days = [days];
  const base = new Date();

  days.forEach((day, i) => {
    const now = new Date(base);
    let time = /[a-z\s]+(\d{1,2}:\d{1,2}:\d{1,2})$/.exec(day);
    time = (time) ? time[1] : '00:00:00';
    now.setDate(+now.getDate() + ((dayNumber(days, i, time) - now.getDay() + 7) % 7));
    days[i] = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${time}`;
  });

  return days;
}

function getCycle(cycles) {
  if (typeof cycles === 'string') cycles = [cycles];

  let r;
  if (cycles[0] === '') {
    r = 's';
  } else if (fmt.week.test(cycles[0])) {
    r = 'w';
  } else {
    r = fmt.norm.exec(cycles[0]);
    if (!r) throw new Error('invalid cycle description');
    if (r[1]) r = '';
    else if (r[2]) r = 'Y';
    else if (r[3]) r = 'M';
    else if (r[4]) r = 'D';
    else if (r[5]) r = 'h';
    else if (r[6]) r = 'm';
  }

  cycles.forEach((cycle, i) => {
    if (i === 0) return;
    if (r !== getCycle(cycle)) throw new Error('inconsistent cycle description');
  });

  return r;
}

// sched = {
//   ?cycle: '' || 'YYYY-MM-DDThh:mm:ss' || [ 'YYYY-MM-DD hh:mm:ss', ... ] ||
//     [ 'Monday hh:mm:ss', ... ],
//   ?step: 1,
//   ?utc: false || true,
//   ?single: false || true,
//   ?keepLast: false || true,
//   ?log: false || true
// }
// job = (ot) => {}
export default function(sched, job) {
  const now = new Date();

  const info = log(sched.id || idcnt++, sched.log);
  sched.cycle = sched.cycle || '';
  if (typeof sched.cycle === 'string') sched.cycle = [sched.cycle];
  sched.step = sched.step || 1;

  const cycle = getCycle(sched.cycle);
  if (cycle === 'w') sched.cycle = convWeekly(sched.cycle);
  info(`job will run ${info.cycleString(cycle)}`);

  if (sched.single) {
    info('only one instance of job will run');

    const thens = [];
    let then;

    const ready = (now) => {
      sched.cycle.forEach((sc) => {
        const t = nextime(cycle, sc, now, sched.utc, sched.keepLast);
        if (t.valueOf() > now.valueOf()) thens.push(t);
      });
      thens.sort((a, b) => b.valueOf() - a.valueOf());

      return thens.length;
    };

    const next = () => {
      then.count = (then.count + 1) % sched.step;
      if (then.count === 0) {
        job(ot);
      } else {
        info(`will wait for ${sched.step - then.count} step(s) to run`);
        ot.done();
      }
    };

    const ot = (() => {
      return {
        done() {
          const now = new Date();
          let t;

          do {
            if (thens.length === 0 && ready(now) === 0) break;
            t = thens.pop();
          } while (t.valueOf() <= now.valueOf());
          if (t) {
            const diff = t.valueOf() - now.valueOf();
            if (diff > 0) {
              info(
                `check for run scheduled after ${info.timeString(diff)} ` +
                `on ${new Date(now.valueOf() + diff)}`,
              );
              then.timer = exTimeout(next, diff);
            }
          }
        },
        cancel() {
          clearTimeout(then.timer);
        },
      };
    })();

    ready(now);
    if (thens.length > 0) {
      const diff = thens.pop().valueOf() - now.valueOf();
      if (diff > 0) {
        info(`job will start after ${info.timeString(diff)} on ${new Date(now.valueOf() + diff)}`);
        then = {
          timer: exTimeout(next, diff),
          count: -1,
        };
      }
    }
  } else {
    info('multiple instances of job may run');

    const thens = [];

    const ot = {
      done() {},
      cancel() {
        thens.forEach((then) => clearTimeout(then.timer));
      },
    };

    sched.cycle.forEach((sc, i) => {
      const next = function next() {
        const now = thens[i].then;
        thens[i].then = nextime(cycle, sc, now, sched.utc, sched.keepLast);
        const diff = thens[i].then.valueOf() - now.valueOf();
        if (diff > 0) {
          thens[i].timer = exTimeout(next, diff);
          info(`check for run scheduled after ${info.timeString(diff)} on ${thens[i].then}`);
        }
        thens[i].count = (thens[i].count + 1) % sched.step;
        if (thens[i].count === 0) job(ot);
        else info(`will wait for ${sched.step - thens[i].count} step(s) to run`);
      };

      thens[i] = {
        then: nextime(cycle, sc, now, sched.utc, sched.keepLast),
        count: -1,
      };
      const diff = thens[i].then.valueOf() - now.valueOf();
      if (diff > 0) {
        info(`job will start after ${info.timeString(diff)} on ${thens[i].then}`);
        thens[i].timer = exTimeout(next, diff);
      }
    });
  }
}

// end of index.js
