/*
 *  finds the next time slot
 */

const {norm: fmt} = require('./fmt');

module.exports = (cycle, s, now, utc, last) => {
  let offset;
  if (utc) {
    utc = 'UTC';
    offset = new Date().getTimezoneOffset();
  } else {
    utc = '';
    offset = 0;
  }

  const mday = (y, m) => {
    const tab = [
      [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    ];

    return tab[(y % 4 === 0 && y % 100 !== 0 || y % 400 === 0) ? 1 : 0][m];
  };

  const adjust = () => {
    switch (cycle) {
      case 'Y':
        s[1]++;
        break;
      case 'M':
        s[2]++;
        if (s[2] > 12) {
          s[2] = 1;
          s[1]++;
        }
        break;
      case 'D':
        s[3]++;
        break;
      case 'w':
        s[3] += 7;
        break;
      case 'h':
        s[4]++;
        break;
      case 'm':
        s[5]++;
        break;
      case 's':
        s[6]++;
        break;
    }
  };

  s = fmt.exec(s) || ['', NaN, NaN, NaN, NaN, NaN, NaN];

  for (let i = 1; i < s.length; i++) s[i] = +s[i];
  if (
    s.length > 0 && (
      (s[1] < 1970 || s[1] > 9999) ||
      (s[2] > 12) ||
      (s[3] > mday(s[1] || 4, s[2] || 0)) ||
      (s[4] > 23 || s[5] > 59 || s[6] > 59)
    )
  ) {
    throw new Error('invalid date');
  }

  now = (now || new Date());
  if (s[1] !== s[1]) s[1] = +now[`get${utc}FullYear`]();
  if (s[2] !== s[2]) s[2] = +now[`get${utc}Month`]() + 1;
  if (s[3] !== s[3]) s[3] = +now[`get${utc}Date`]();
  if (s[4] !== s[4]) s[4] = +now[`get${utc}Hours`]();
  if (s[5] !== s[5]) s[5] = +now[`get${utc}Minutes`]();
  if (s[6] !== s[6]) s[6] = +now[`get${utc}Seconds`]();

  let then;
  for (;;) {
    then = new Date(s[1], s[2] - 1, s[3], s[4], s[5] - offset, s[6], 0);
    if (!then) throw new Error('invalid date');
    if ((cycle === 'Y' || cycle === 'M') && +then[`get${utc}Month`]() !== s[2] - 1) {
      if (last) {
        then = new Date(s[1], s[2] - 1, mday(s[1], s[2]), s[4], s[5] - offset, s[6], 0);
      } else {
        adjust();
        continue;
      }
    }
    if (cycle && then.valueOf() <= now.valueOf()) adjust();
    else break;
  }

  return then;
};

// end of nextime.js
