ontime: a human-readable cron
=============================

`ontime` is a [`cron`](http://en.wikipedia.org/wiki/Cron)-like job scheduler
with readable time expressions.

For example, the following code invokes the given function on 4:30AM and 9AM
every day (i.e., twice a day).

    var ontime = require('ontime')

    ontime({
        cycle: [ '04:30:00', '9:00:00' ]
    }, function (ot) {
        // do your job here
        ot.done()
        return
    })

It supports:

- to describe jobs that should get done yearly, monthly, weekly, daily, every
  minute, every second or on specified times;
- to skip running a job based on a specified step; e.g., to run it every 2
  weeks;
- to use a local time or
  [UTC](http://en.wikipedia.org/wiki/Coordinated_Universal_Time);
- to track the last day of a month; possible to run a job on the last day of
  every month; and
- to wait for the currently running job to get finished, which ensures that at
  most only one instance of your job be running at a time

but does not yet support:

- a [lunar calendar](http://en.wikipedia.org/wiki/Lunar_calendar),
- [DST(Daylight Saving Time) or Summer Time](http://en.wikipedia.org/wiki/Daylight_saving_time)
  (UTC provides a work-around for DST) and
- [leap seconds](http://en.wikipedia.org/wiki/Leap_second).


### Options

Options to `ontime` control the cycle of a job, choose between a local time and
UTC, enable to keep track of the last day of a month and so on. In explaining
options, each section header shows the option it explains and its default
value in parentheses.


#### Time expressions (`cycle: ''`)

`ontime` determines the cycle of a job based on the format of time expressions.
The time expression basically has the form of an
[ISO-8601 Date Format](http://en.wikipedia.org/wiki/ISO_8601),
`YYYY-MM-DDThh:mm:ss` where `YYYY` indicates a year, `MM` a month, `DD` a day
of the month, `hh` an hour, `mm` a minute and `ss` a second, except that:

- A unit can be omitted only when units greater than that are also omitted,
  which means the day part(`DD`) cannot be omitted unless the year and month
  parts(`YYYY-MM-`) are. This makes `ontime`'s time expression differ from the
  original ISO-8601 format because the later allows smaller units to be omitted
  in times. For example, `12` and `12:00` denote `hh` and `hh:mm` respectively
  in the ISO-8601 format while `ss` and `mm:ss` respectively in the `ontime`'s
  format;
- A space can be used to separate the time part from the date part instead of
  `T` as in `2010-01-09 11:00:00`; and
- `ontime` allows digits not to be zero-padded; for example, it accepts
  `2014-5-4T0:0:0` as well as `2014-05-04T00:00:00`.

The time expression is given to `ontime` through the `cycle` option. You can
give a single expression of the string type like `'01-01T12:00:00'` or multiple
ones as an array of strings like `[ '01-01T12:00:00', '7-1T0:0:0' ]`.


##### Yearly jobs

The year part(`YYYY-`) should be omitted to specify yearly jobs.

    ontime({
        cycle: '2-9T00:00:00'
    }, function (ot) {
        console.log('my birthday!')
        ot.done()
        return
    })

This code prints on February 9 every year.

Note how the last day of February is handled on a leap year. If you set the
time expression to February 29 as in `'2-29T00:00:00'`, the job will be
triggered only in leap years. See the `keepLast` option to change this
behavior.


##### Monthly jobs

The year and month parts(`YYYY-MM-`) should be omitted for monthly jobs.

    ontime({
        cycle: [ '1T12:00:00', '15T12:00:00' ]
    }, function (ot) {
        console.log('review the project')
        ot.done()
        return
    })

This code prints on the 1th and 15th days of each month.

Note how the last day of a month is handled. If you set the time expression to
the 31th day as in `31 23:59:59`, the job will run only on January, March, May,
July, August, October and December since others have no 31th day. Use the
`keepLast` option to change this behavior.


##### Daily jobs

The whole date part(`YYYY-MM-DDT`) should be omitted for daily jobs; note that
the separator `T` should be also dropped.

    ontime({
        cycle: '12:00:00'
    }, function (ot) {
        console.log('lunch time!')
        ot.done()
        return
    })

This code prints on noon every day.


##### Weekly jobs

Weekly jobs have a different format to specify a day of a week.

    ontime({
        cycle: [ 'Sunday 12:00:00', 'sat 12:00:00' ]
    }, function (ot) {
        console.log('weekend!')
        ot.done()
        return
    })

This code prints on Saturday and Sunday every week.

For convenience, `weekday` and `weekend` are supported as shorthands for `Mon`
to `Fri` and `Sat` to `Sun`, respectively.

    ontime({
        cycle: 'Weekend 12:00:00'
    }, function (ot) {
        console.log('weekend!')
        ot.done()
        return
    })

is equivalent to the example above.


##### Hourly jobs

The date and hour parts(`YYYY-MM-DDThh:`) should be omitted for hourly jobs.

    ontime({
        cycle: [ '00:00', '30:00' ]
    }, function (ot) {
        console.log('30 mins to next run')
        ot.done()
        return
    })

This code prints every 30 minutes (twice an hour).


##### Jobs on every minute

By omitting all units except for seconds, a job can be invoked every minute.

    ontime({
        cycle: [ '10', '30', '50' ]
    }, function (ot) {
        console.log('20 secs to next run')
    })

This code prints on the 10th, 30th and 50th seconds of every minute.


##### Jobs on every second

An empty string denotes jobs that get started every second.

    var count = 0

    ontime({
        cycle: '',
    }, function (ot) {
        console.log(++count)
        ot.done()
        return
    })

This counts up every second.


##### Jobs on specified times

You can trigger your job on explicitly specified times.

    ontime({
        cycle: [ '2100-1-9 9:00:00',
                 '2200-1-9 9:0:0' ]
    }, function (ot) {
        console.log('what is this day?')
        ot.done()
        return
    })

This prints on 9AM of 9 January 2100 and the same time of 2200 if you're using
`node.js` until then.


##### Mixing different cycles

In order to keep the model and the interface simple, a single type of job cycle
is allowed for each invocation of `ontime`. Mixing different cycle types can be
achieved by introducing multiple invocations to `ontime` as in:

    ontime({
        cycle: [ '01-09 11:30:00',        // yearly
                 'Saturday 12:00:00' ]    // weekly
    }, job)    // mixed types of cycle result in error

    ontime({
        cycle: '01-09 11:30:00'    // yearly
    }, job)
    ontime({
        cycle: 'Sat 12:0:0'    // weekly
    }, job)


#### Skipping steps (`step: 1`)

The `step` option enables a job to be skipped periodically. Setting it to _n_
forces `ontime` to skip a given job _n_-1 times after a run, which leads to
launching the job eveny _n_ cycles.

    ontime({
        cycle:    '31T00:00:00',
        keepLast: true,
        step:     3
    }, function (ot) {
        console.log('every 3 months')
        ot.done()
        return
    })

This prints on the last day of a month every three months.

Note how this option interacts with the `single` option.


#### A local time vs. UTC (`utc: false`)

Setting the `utc` option to `true` changes `ontime` to interpret the time
expressions as UTC.

This is useful

- when you cannot be sure of what the time zone on your system is; and
- when you do not want to miss or run twice your job when the time shifts back
  or forward an hour for DST.


#### Preserving a single instance (`single: false`)

`ontime` launches a job on its scheduled time. If the job takes longer than the
time interval of the cycle, more than one instance of the job may run at the
same time. The `single` option keeps another instance of a job from starting if
there is already a running one.

To be precise, with `single` set to `false`, `ontime` schedules the next run at
the start of the current run. Changing that to `true` has the next run
scheduled when the `ot.done()` method is invoked by a user.

The following two diagrams show the difference, where labelled `|` and `+`
denote time spots to start new instances, and `*` indicates their execution.

    ontime({
        cycle:  [ A, B ],
        single: false    // default
    }, function (ot) {
        // ...
        ot.done()
        return
    })

         A          A    B     A         BA
    - - -|----------|----+-----|---------+|- - -
         *************
                    *********
                         ****
                               *****

    ontime({
        cycle:  [ A, B ],
        single: true
    }, function (ot) {
        // ...
        ot.done()
        return
    })

         A          A    B     A         BA
    - - -|----------|----+-----|---------+|- - -
         *************   *********       ****

Exclusiveness of job execution is guaranteed only within a single invocation to
`ontime`. Two difference invocations to `ontime` cannot interpose with each
other.


#### Keeping the last day of a month (`keepLast: false`)

It is sometimes necessary to run a job on the last day of each month, which
have been replaced with doing it on the first day of each month instead. By
setting the `keepLast` option to `true`, `ontime` automatically adjusts the
date part(`DD`) to the last day according to the value of the month part(`MM`)
if necessary.

    ontime({
        cycle:    '31T10:00:00',
        keepLast: true
    }, function (ot) {
        console.log('the last day')
        ot.done()
        return
    })

This code prints on the 31th day of a month when the month has the 31th day, on
the 28th or 29th when February, or on the 30th day otherwise. Another example
goes for yearly jobs:

    ontime({
        cycle:    '2-29T10:00:00',
        keepLast: true
    }, function (ot) {
        console.log('the last day of Feb')
        ot.done()
        return
    })

This code prints on 29 February on a leap year and on 28 February otherwise.


#### Logging messages (`log: false`)

`ontime` has a very simple form of logging that is useful when checking if your
configuration works as intended. It can be turned on by setting the `log`
option to `true`.


### Methods

A job function should be defined as to accept at least one argument that is
referred to as `ot` in this document. The argument contains these methods:

- `ot.done()`: should be called after the job has been finished. This is
  important especially when `single` is set to `true` because scheduling the
  next run is done in the method.
- `ot.cancel()`: clears timers for scheduling jobs that the `ontime` instance
  knows. This does not terminate the current execution of a job; you still need
  to call `ot.done()` for that purpose.


`INSTALL.md` explains how to build and install the library. For the copyright
issues, see the accompanying `LICENSE.md` file.

If you have a question or suggestion, do not hesitate to contact me via email
(woong.jun at gmail.com) or web (http://code.woong.org/).
