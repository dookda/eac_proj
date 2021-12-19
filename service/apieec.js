const express = require('express');
const app = express.Router();
const con = require("./db");
const eec = con.eec;
const dat = con.dat;
const th = con.th;
const geo = con.geo;

app.get("/eec-api/get-extent/:lyr/:val", (req, res) => {
    const lyr = req.params.lyr;
    const val = req.params.val;
    let sql;

    if (lyr == "pro") {
        sql = `SELECT ST_AsGeoJSON(ST_Envelope(ST_FlipCoordinates(geom))) as geom
            FROM province_4326
            WHERE pv_idn = '${val}'`;
    } else if (lyr == "amp") {
        sql = `SELECT ST_AsGeoJSON(ST_Envelope(ST_FlipCoordinates(geom))) as geom
            FROM amphoe_4326
            WHERE ap_idn = '${val}'`;
    } else if (lyr == "tam") {
        sql = `SELECT ST_AsGeoJSON(ST_Envelope(ST_FlipCoordinates(geom))) as geom
            FROM tambon_4326
            WHERE tb_idn = '${val}'`;
    }

    th.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-bound/:lyr/:val", (req, res) => {
    const lyr = req.params.lyr;
    const val = req.params.val;
    let sql;

    if (lyr == "pro") {
        sql = `SELECT ST_AsGeoJSON(geom) as geom
            FROM province_4326
            WHERE pv_idn = '${val}'`;
    } else if (lyr == "amp") {
        sql = `SELECT ST_AsGeoJSON(geom) as geom
            FROM amphoe_4326
            WHERE ap_idn = '${val}'`;
    } else if (lyr == "tam") {
        sql = `SELECT ST_AsGeoJSON(geom) as geom
            FROM tambon_4326
            WHERE tb_idn = '${val}'`;
    }

    th.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-bound-flip/:lyr/:val", (req, res) => {
    const lyr = req.params.lyr;
    const val = req.params.val;
    let sql;

    if (lyr == "pro") {

        if (val == "eec") {
            sql = `SELECT ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(geom, 4326))) as geom
                    FROM _00_bound_eec`;
        } else {
            sql = `SELECT ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(geom, 4326))) as geom
                FROM _01_prov_eec
                WHERE pv_idn = '${val}'`;
        }
    } else if (lyr == "amp") {
        sql = `SELECT ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(geom, 4326))) as geom
            FROM _02_amphoe_eec
            WHERE ap_idn = '${val}'`;
    } else if (lyr == "tam") {
        sql = `SELECT ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(geom, 4326))) as geom
            FROM _03_tambon_eec
            WHERE tb_idn = '${val}'`;
    }

    geo.query(sql).then((r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-prov", (req, res) => {
    const sql = `SELECT prov_code, prov_namt, prov_name
        FROM eec_pro_4326`;
    eec.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-amp/:procode", (req, res) => {
    const procode = req.params.procode;
    const sql = `SELECT prov_code, prov_namt, prov_name, CONCAT(prov_code, amp_code) as amphoe_idn, amp_namt, amp_name
        FROM eec_amp_4326 WHERE prov_code='${procode}' `;
    eec.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-tam/:ampcode", (req, res) => {
    const ampcode = req.params.ampcode;
    const sql = `SELECT prov_code, prov_namt, prov_name, CONCAT(prov_code, amp_code) as amphoe_idn, amp_namt, amp_name, CONCAT(prov_code, amp_code, tam_code) as tambon_idn, tam_namt, tam_name
        FROM eec_tam_4326 WHERE CONCAT(prov_code, amp_code)='${ampcode}' `;
    eec.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-aqi", (req, res) => {
    const sql = `SELECT * FROM v_pcd_aqi_eec`;
    dat.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})


app.post("/eec-api/get-aqi-bytam", (req, res) => {
    const { col, val } = req.body;
    let sql
    if (col == 'pro') {
        if (val == "eec") {
            sql = `SELECT * FROM v_pcd_aqi_eec_by_tam`;
        } else {
            sql = `SELECT * FROM v_pcd_aqi_eec_by_tam WHERE prov_code='${val}'`;
        }
    } else if (col == 'amp') {
        sql = `SELECT * FROM v_pcd_aqi_eec_by_tam WHERE amp_code='${val}'`;
    } else {
        sql = `SELECT * FROM v_pcd_aqi_eec_by_tam WHERE tam_code='${val}'`;
    }

    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})


app.get("/eec-api/get-aqi-all", (req, res) => {
    const sql = `SELECT * FROM v_pcd_aqi_all`;
    dat.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-av-aqi", (req, res) => {
    const sql = `SELECT avg(s.pm25) as pm25, avg(s.pm10) as pm10, avg(s.o3) as o3, 
            avg(s.co) as co, avg(s.no2) as no2, avg(s.so2) as so2, avg(s.aqi) as aqi
        FROM
        (SELECT tt.sta_id, tt.sta_th, tt.sta_en, tt.area_th, tt.area_en, tt.sta_type, 
            tt.lat, tt.lon, TO_CHAR(tt.date_, 'YYYY-MM-DD') as date_, 
            TO_CHAR(time_, 'HH24:MM') as time_, CONCAT(tt.date_,' ',tt.time_)::timestamp as dt,
            tt.pm25, tt.pm10, tt.o3, tt.co, tt.no2, tt.so2, tt.aqi
            FROM aqi_hourly_pcd tt
            WHERE tt.sta_id = 'bkp80t' OR tt.sta_id = '19t' OR tt.sta_id = '77t'
                OR tt.sta_id = '34t'OR tt.sta_id = '32t' OR tt.sta_id = '28t' 
                OR tt.sta_id = '33t' OR tt.sta_id = '30t' OR tt.sta_id = '74t'
                OR tt.sta_id = '29t' OR tt.sta_id = '31t' OR tt.sta_id = 'm9'
            GROUP BY tt.sta_id,tt.sta_th, tt.sta_en, tt.area_th, tt.area_en, tt.sta_type, 
                tt.lat, tt.lon, tt.date_, tt.time_, tt.pm25, tt.pm10, tt.o3, tt.co, tt.no2, tt.so2, tt.aqi
        ) as s
        INNER JOIN 
        (SELECT sta_id, MAX(CONCAT(date_,' ',time_)::timestamp) AS dt
            FROM aqi_hourly_pcd
            GROUP BY sta_id) as m
        ON s.sta_id = m.sta_id
        WHERE s.dt = m.dt`;
    dat.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.post("/eec-api/get-aqi-near", (req, res) => {
    const { geom } = req.body;
    const sql = `
    SELECT *, TO_CHAR(dt, 'DD MON YYYY') as dt_,
        ST_Distance(ST_Transform(geom, 32648), ST_Transform(ST_Geomfromtext('Point(${geom.lng} ${geom.lat})', 4326), 32648))  as dist
    FROM v_pcd_aqi_all
    ORDER BY dist ASC
    LIMIT 1
    `
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/eec-api/get-hist", (req, res) => {
    const { sta_id } = req.body;
    const sql = `SELECT  DISTINCT CONCAT(date_, ' ', time_) AS date_, 
                    date_ as d, time_ as t, 
                    sta_id, sta_th, 
                    avg(pm25) as pm25,
                    avg(pm10) as pm10, 
                    avg(o3) as o3, 
                    avg(co) as co, 
                    avg(no2) as no2, 
                    avg(so2) as so2, 
                    avg(aqi) as aqi
                    FROM aqi_hourly_pcd
                    WHERE sta_id = '${sta_id}' AND date_ > current_date - interval '14 days'
                    GROUP BY date_, time_, sta_id, sta_th 
                    ORDER BY date_, time_`
    dat.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-weather", (req, res) => {
    const sql = `SELECT * FROM v_tmd_weather_day_eec`
    dat.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-weather-3hr", (req, res) => {
    const sql = `SELECT * FROM v_tmd_weather_3hr_eec`;
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/eec-api/get-weather-3hr-bytam", (req, res) => {
    const { col, val } = req.body;
    let sql
    if (col == 'pro') {
        if (val == "eec") {
            sql = `SELECT * FROM v_tmd_weather_3hr_eec_by_tam`;
        } else {
            sql = `SELECT * FROM v_tmd_weather_3hr_eec_by_tam WHERE prov_code='${val}'`;
        }
    } else if (col == 'amp') {
        sql = `SELECT * FROM v_tmd_weather_3hr_eec_by_tam WHERE amp_code='${val}'`;
    } else {
        sql = `SELECT * FROM v_tmd_weather_3hr_eec_by_tam WHERE tam_code='${val}'`;
    }

    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.get("/eec-api/get-weather-3hr-all", (req, res) => {
    const sql = `SELECT * FROM v_tmd_weather_3hr_all`;
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/eec-api/get-weather-hist", (req, res) => {
    const { sta_num } = req.body;
    const sql = `
        SELECT *, TO_CHAR(datetime, 'YYYY-MM-DD') as date_
        FROM weather_daily_tmd
        WHERE sta_num = '${sta_num}' and datetime > current_date - interval '14 days'
        ORDER BY datetime
    `
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/eec-api/get-weather-near", (req, res) => {
    const { geom } = req.body;
    const sql = `
    SELECT *, ST_Distance(ST_Transform(geom, 32648), ST_Transform(ST_Geomfromtext('Point(${geom.lng} ${geom.lat})', 4326), 32648))  as dist
    FROM v_tmd_weather_3hr_all
    ORDER BY dist ASC
    LIMIT 1
    `
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.get("/eec-api/get-wtrl", (req, res) => {
    const sql = `SELECT * from v_wtrl_hii_all_eec_by_tam WHERE prov_code='20' or prov_code='21' or prov_code='24'`;
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})
app.post("/eec-api/get-wtrl/timeline", (req, res) => {
    const { staname } = req.body;
    const sql = `SELECT * from public.wtrl_hii_hr where waterlevel_datetime>= (CURRENT_DATE - '14 days'::interval day) and tele_station_name ='${staname}'`;
    dat.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.get("/eec-api/get-th-prov", (req, res) => {
    const sql = `SELECT pv_idn, pro_name FROM province_4326`;
    th.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-th-amp/:procode", (req, res) => {
    const procode = req.params.procode;
    const sql = `SELECT pv_idn, pro_name, ap_idn, amp_name FROM amphoe_4326 WHERE pv_idn='${procode}'`;
    th.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-th-tam/:ampcode", (req, res) => {
    const ampcode = req.params.ampcode;
    const sql = `SELECT pv_idn, pro_name, ap_idn, amp_name, tb_idn, tam_name 
        FROM tambon_4326 WHERE ap_idn='${ampcode}'`;
    th.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.get("/eec-api/get-th-onetam/:tamcode", (req, res) => {
    const tamcode = req.params.tamcode;
    const sql = `SELECT pv_idn, pro_name, ap_idn, amp_name, tb_idn, tam_name 
        FROM tambon_4326 WHERE tb_idn='${tamcode}'`;
    th.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.post("/eec-api/get-landuse-info", (req, res) => {
    const { lat, lon } = req.body;
    const sql = `SELECT lu_des_th,st_area(geom) AS area
                FROM _46_lu_eec_61  a
                WHERE ST_Within(ST_GeomFromText('POINT(${lon} ${lat})', 4326), 
                     ST_TransForm(a.geom, 4326)) = true`;
    geo.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.post("/eec-api/get-tam-info", (req, res) => {
    const { lat, lon } = req.body;
    const sql = `SELECT tam_nam_t, amphoe_t, prov_nam_t 
                FROM _03_tambon_eec a
                WHERE ST_Within(ST_GeomFromText('POINT(${lon} ${lat})', 4326), 
                     ST_TransForm(a.geom, 4326)) = true`;
    geo.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

app.post("/eec-api/get-geomarea", async (req, res) => {
    const { geom } = req.body;
    let g = [];
    await geom.map(i => {
        const sql = `SELECT ST_Area(ST_Transform(ST_GeomFromGeoJSON('${JSON.stringify(i.geometry)}'), 32647)) As area`;
        geo.query(sql).then(r => {
            // console.log(r.rows[0]);
            g.push(r.rows[0].area);
        })
    })

    console.log(g);
    // const sql = `SELECT ST_Area(ST_Transform(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'), 32647)) As area`;
    // geo.query(sql).then((r) => {
    //     res.status(200).json({
    //         data: r.rows
    //     });
    // });
})

app.get("/eec-api/gettambylatlon/:lat/:lon", (req, res) => {
    const lat = req.params.lat;
    const lon = req.params.lon;
    const sql = `SELECT tam_nam_t, amphoe_t, prov_nam_t 
                FROM _03_tambon_eec a
                WHERE ST_Within(ST_GeomFromText('POINT(${lon} ${lat})', 4326), 
                     ST_TransForm(a.geom, 4326)) = true`;
    geo.query(sql).then((r) => {
        res.status(200).json({
            data: r.rows
        });
    });
})

module.exports = app;