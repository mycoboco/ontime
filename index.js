/*
 *  ontime: a human-readable cron
 */

'use strict'

var nextime = require('./lib/nextime')


var fmt = require('./lib/fmt')
var idcnt = 0


function log(id, enabled) {
    var r

    if (!enabled) {
        r = function () {}
        r.cycleString = function () { return '' }
        r.timeString = function () { return '' }

        return r
    }

    var r = function (msg) {
        console.log('[ontime] '+id+': '+msg)
    }

    r.cycleString = function (cycle) {
        var t = {
            '':  'on speicifed times',
            's': 'every second',
            'm': 'every minute',
            'h': 'hourly',
            'w': 'weekly',
            'D': 'daily',
            'M': 'monthly',
            'Y': 'yearly'
        }

        return t[cycle]
    }

    r.timeString = function (ms) {
        ms /= 1000
        if (ms / (60*60*24*365) >= 1) return Math.floor(ms/(60*60*24*365)) + ' year(s)'
        if (ms / (60*60*24*30) >= 1)  return Math.floor(ms/(60*60*24*30))  + ' month(s)'
        if (ms / (60*60*24*7) >= 1)   return Math.floor(ms/(60*60*24*7))   + ' week(s)'
        if (ms / (60*60*24) >= 1)     return Math.floor(ms/(60*60*24))     + ' day(s)'
        if (ms / (60*60) >= 1)        return Math.floor(ms/(60*60))        + ' hour(s)'
        if (ms / 60 >= 1)             return Math.floor(ms/60)             + ' min(s)'
        return Math.floor(ms) + ' sec(s)'
    }

    return r
}


function exTimeout(job, time) {
    var max = 0x7fffffff

    if (time > max) {
        return (function (remain) {
            return setTimeout(function () {
                exTimeout(job, remain)
            }, max)
        })(time - max)
    }

    return setTimeout(job, time)
}


function convWeekly(days) {
    var day, time, base, now

    var dayNumber = function (s) {
        switch(s.toLowerCase().substring(0, 2)) {
            case 'su':
                return 0
            case 'mo':
                return 1
            case 'tu':
                return 2
            case 'we':
                return 3
            case 'th':
                return 4
            case 'fr':
                return 5
            case 'sa':
                return 6
        }

        return 0
    }

    days = days || []
    if (typeof days === 'string') days = [ days ]
    base = new Date()

    for (var i = 0; i < days.length; i++) {
        now = new Date(base)
        day = dayNumber(days[i])
        time = /[a-z\s]+(\d{1,2}:\d{1,2}:\d{1,2})$/.exec(days[i])
        time = (time)? time[1]: '00:00:00'
        now.setDate(+now.getDate() + ((day-now.getDay()+7)%7))
        days[i] = now.getFullYear()+'-'+(+now.getMonth()+1)+'-'+now.getDate()+'T'+time
    }

    return days
}


function getCycle(cycle) {
    var r

    if (typeof cycle === 'string') cycle = [ cycle ]

    if (cycle[0] === '') {
        r = 's'
    } else if (fmt.week.test(cycle[0])) {
        r = 'w'
    } else {
        r = fmt.norm.exec(cycle[0])
        if (!r) throw new Error('invalid cycle description')
        if (r[1]) r = ''
        else if (r[2]) r = 'Y'
        else if (r[3]) r = 'M'
        else if (r[4]) r = 'D'
        else if (r[5]) r = 'h'
        else if (r[6]) r = 'm'
    }

    for (var i = 1; i < cycle.length; i++) {
        if (r !== getCycle(cycle[i])) throw new Error('inconsistent cycle description')
    }

    return r
}


// sched = {
//     ?cycle:    '' || 'YYYY-MM-DDThh:mm:ss' || [ 'YYYY-MM-DD hh:mm:ss', ... ] ||
//                [ 'Monday hh:mm:ss', ... ],
//     ?step:     1,
//     ?utc:      false || true,
//     ?single:   false || true,
//     ?keepLast: false || true,
//     ?log:      false || true
// }
// job = function (ot) {}
module.exports = function (sched, job) {
    var info
    var diff, cycle
    var now = new Date()

    info = log(sched.id || idcnt++, sched.log)
    sched.cycle = sched.cycle || ''
    if (typeof sched.cycle === 'string') sched.cycle = [ sched.cycle ]
    sched.step = sched.step || 1

    cycle = getCycle(sched.cycle)
    if (cycle === 'w') sched.cycle = convWeekly(sched.cycle)
    info('job will run '+info.cycleString(cycle))

    if (sched.single) {
        info('only one instance of job will run')
        !function () {
            var ready, next
            var then, thens = []
            var ot = {
                done: function () {
                    var now = new Date(), then

                    do {
                        if (thens.length === 0 && ready(now) === 0) break
                        then = thens.pop()
                    } while(then.valueOf() <= now.valueOf())
                    if (then) {
                        diff = then.valueOf() - now.valueOf()
                        if (diff > 0) {
                            info('check for run scheduled after '+info.timeString(diff)+' on '+
                                 new Date(now.valueOf()+diff))
                            then.timer = exTimeout(next, diff)
                        }
                    }
                },
                cancel: function () {
                    cancelTimeout(then.timer)
                }
            }

            ready = function (now) {
                var then

                for (var i = 0; i < sched.cycle.length; i++) {
                    then = nextime(cycle, sched.cycle[i], now, sched.utc, sched.keepLast)
                    ;(then.valueOf() > now.valueOf()) && thens.push(then)
                }
                thens.sort(function (a, b) {
                    return b.valueOf() - a.valueOf()
                })

                return thens.length
            }

            next = function () {
                then.count = (then.count+1) % sched.step
                if (then.count === 0) {
                    job(ot)
                } else {
                    info('will wait for '+(sched.step-then.count)+' step(s) to run')
                    ot.done()
                }
            }

            ready(now)
            if (thens.length > 0) {
                diff = thens.pop().valueOf()-now.valueOf()
                if (diff > 0) {
                    info('job will start after '+info.timeString(diff)+' on '+
                         new Date(now.valueOf()+diff))
                    then = {
                        timer: exTimeout(next, diff),
                        count: -1
                    }
                }
            }
        }()
    } else {
        info('multiple instances of job may run')
        !function () {
            var thens = []
            var ot = {
                done:   function () {},
                cancel: function () {
                    for (var i = 0; i < thens.length; i++) clearTimeout(thens[i].timer)
                }
            }

            for (var i = 0; i < sched.cycle.length; i++) {
                !function (i) {
                    var next = function next() {
                        var now = thens[i].then
                        thens[i].then = nextime(cycle, sched.cycle[i], now, sched.utc,
                                                sched.keepLast)
                        diff = thens[i].then.valueOf()-now.valueOf()
                        if (diff > 0) {
                            thens[i].timer = exTimeout(next, diff)
                            info('check for run scheduled after '+info.timeString(diff)+' on '+
                                 thens[i].then)
                        }
                        thens[i].count = (thens[i].count+1) % sched.step
                        if (thens[i].count === 0) job(ot)
                        else info('will wait for '+(sched.step-thens[i].count)+' step(s) to run')
                    }

                    thens[i] = {
                        then:  nextime(cycle, sched.cycle[i], now, sched.utc, sched.keepLast),
                        count: -1
                    }
                    diff = thens[i].then.valueOf()-now.valueOf()
                    if (diff > 0) {
                        info('job will start after '+info.timeString(diff)+' on '+thens[i].then)
                        thens[i].timer = exTimeout(next, diff)
                    }
                }(i)
            }
        }()
    }
}

// end of index.js
