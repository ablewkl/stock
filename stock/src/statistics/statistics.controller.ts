import { Controller, Get, Query } from '@nestjs/common';
import { createConnection } from 'mysql';
// 创建数据库连接
const connection = createConnection({
    host: 'localhost', // 数据库服务器地址
    user: 'root', // 数据库用户名
    password: 'root', // 数据库密码
    database: 'stock' // 要连接的数据库名
});

// 连接数据库
connection.connect(err => {
    if (err) {
        return console.error('error connecting: ' + err.stack);
    }

    console.log('connected as id ' + connection.threadId);
});

@Controller('statistics')
export class StatisticsController {
    @Get()
    test() {
        for (let startInx = 3; startInx < 3 + 7; startInx++) {
            console.log(startInx)
        }
    }

    @Get('static')
    static(@Query() q: any) {
        connection.query(`select * from limitup where 1`, (err, res, fields) => {
            //         if (err) throw err;
            let wn = 0
            let w5 = 0
            let l5 = 0
            let cc = 0
            let cres = 0
            let win = 0
            let lose = 0
            let ln = 0
            const all = 10193 // select (id) from limitup
            res.forEach(row => {
                const riseprice = row.riseprice
                const after7rise = JSON.parse(row.after7rise)
                const before20ma = JSON.parse(row.before20ma)

                // if (riseprice >= before20ma[0].ma60) {
                cc++
                if ((Number(after7rise[0].rise) >= -5 && Number(after7rise[0].rise) < 2) || (Number(after7rise[0].rise) >= -9 && Number(after7rise[0].rise) < -8) || (Number(after7rise[0].rise) >= 6 && Number(after7rise[0].rise) < 7)) {
                    cres++
                    if (Number(after7rise[1].rise) > Number(after7rise[0].rise)) {
                        wn++
                        win += Number(after7rise[1].rise) - Number(after7rise[0].rise)
                        // if (Number(after7rise[1].rise) - Number(after7rise[0].rise) > 5) {
                        //     w5++
                        //     console.log('win code:', row.stock_code, 'win date:', row.limitupdate)
                        // }
                        // console.log('win ------ ', Number(after7rise[1].rise)-Number(after7rise[0].rise))
                    } else if (Number(after7rise[2].rise) > Number(after7rise[0].rise)) {
                        wn++
                        win += Number(after7rise[2].rise) - Number(after7rise[0].rise)
                        // if (Number(after7rise[1].rise) - Number(after7rise[0].rise) > 5) {
                        //     w5++
                        //     console.log('win code:', row.stock_code, 'win date:', row.limitupdate)
                        // }
                        // console.log('win ------ ', Number(after7rise[2].rise) - Number(after7rise[0].rise))
                    } else if (Number(after7rise[3].rise) > Number(after7rise[0].rise)) {
                        wn++
                        win += Number(after7rise[3].rise) - Number(after7rise[0].rise)
                        // if (Number(after7rise[1].rise) - Number(after7rise[0].rise) > 5) {
                        //     w5++
                        //     console.log('win code:', row.stock_code, 'win date:', row.limitupdate)
                        // }
                        // console.log('win ------ ', Number(after7rise[3].rise) - Number(after7rise[0].rise))
                    } else {
                        ln++
                        lose += Number(after7rise[3].rise) - Number(after7rise[0].rise)
                        if (Number(after7rise[1].rise) - Number(after7rise[0].rise) < -5) {
                            l5++
                            console.log('lose code:', row.stock_code, 'lose date:', row.limitupdate)
                        }
                        // console.log('lose ------ ', Number(after7rise[3].rise) - Number(after7rise[0].rise))

                    }
                }
                // }


            })
            // console.log(cc, cres)
            console.log('l5:', l5)
            // console.log('---------------------q:', q.q)
            // console.log('wn:', wn, 'ln:', ln)
            // console.log('pingjunwin:', win / wn)
            // console.log('pingjunlose:', lose / ln)
            // console.log('wn / cres:', wn / cres)
            // console.log('win:', win, 'lose:', lose, 'all:', win + lose)
        })
    }


}
