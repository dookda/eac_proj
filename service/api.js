const express = require('express');
const app = express.Router();
const con = require("./db");
const eec = con.eec;

// const multer = require('multer')
// const upload = multer()

app.post("/org-api/getone", (req, res) => {
    const { orgid } = req.body;
    const sql = `SELECT *,ST_AsGeojson(geom) as geojson 
                FROM organization
                WHERE orgid='${orgid}'`
    eec.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/org-api/getdata", (req, res) => {
    const { userid } = req.body;
    const sql = `SELECT *,ST_AsGeojson(geom) as geojson 
        FROM organization`;

    eec.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/org-api/insert", async (req, res) => {
    const { data } = req.body;
    let orgid = Date.now()

    await eec.query(`INSERT INTO organization(orgid)VALUES('${orgid}')`)
    let d;
    for (d in data) {
        if (data[d] !== '' && d !== 'geom') {
            let sql = `UPDATE organization SET ${d}='${data[d]}' WHERE orgid='${orgid}'`
            console.log(sql);
            await eec.query(sql)
        }
    }
    if (data.geom !== "") {
        let sql = `UPDATE organization SET geom=ST_GeomfromGeoJSON('${JSON.stringify(data.geom.geometry)}')
                    WHERE orgid='${orgid}'`
        await eec.query(sql)
    }
    res.status(200).json({
        data: "success"
    })
})

app.post("/org-api/update", async (req, res) => {
    const { data, orgid } = req.body;

    let d;
    for (d in data) {
        if (data[d] !== '' && d !== 'geom') {
            let sql = `UPDATE organization SET ${d}='${data[d]}' WHERE orgid='${orgid}'`
            console.log(sql);
            await eec.query(sql)
        }
    }
    if (data.geom !== "" && data.geom.geometry) {
        let sql = `UPDATE organization SET geom=ST_GeomfromGeoJSON('${JSON.stringify(data.geom.geometry)}')
                    WHERE orgid='${orgid}'`
        await eec.query(sql)
    }
    res.status(200).json({
        data: "success"
    })
})

app.post("/org-api/delete", (req, res) => {
    const { orgid } = req.body;
    const sql = `DELETE FROM organization WHERE orgid='${orgid}'`
    eec.query(sql).then(r => {
        res.status(200).json({
            data: "success"
        })
    })
})


////////////ความมั่นคงทางอาหาร///////////////
app.post("/food_security/savedata", async (req, res) => {
    const { data } = req.body;
    // console.log(data)
    data.map(async (x) => {
        let y = `INSERT INTO food_security (id_date) VALUES ('${x.id_date}');`
        // console.log(y)
        await eec.query(y)
        let d;
        for (d in x) {
            // console.log(d)
            if (x[d] !== '' && d !== 'id_date' && d !== 'geom') {
                let sql = `UPDATE food_security SET ${d} ='${x[d]}' WHERE id_date ='${x.id_date}';`
                // console.log(sql);
                eec.query(sql)
            }
        }
        if (x.geom !== "") {
            let sql = `UPDATE food_security SET geom = ST_GeomfromGeoJSON('${JSON.stringify(x.geom)}')
                                WHERE id_date ='${x.id_date}';`
            // console.log(sql);
            eec.query(sql)
        }
    })
    res.status(200).json({
        data: "success"
    })
})
app.post("/food_security/get/id", async (req, res) => {
    const { id_user } = req.body;
    let sql = `select * from food_security where id_user ='${id_user}' order by gid `
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})
app.get("/food_security/gets/id", async (req, res) => {
    const { staid } = req.body
    let sql = `select * from food_security order by gid;`
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })
})
app.get("/food_security/getgeom/id", async (req, res) => {
    const { staid } = req.body
    let sql = `SELECT *,ST_AsGeojson(geom) as geojson, ST_x(ST_Centroid(geom)) as glon, ST_y(ST_Centroid(geom))as glat,CAST(datereport AS timestamp) as date_re from food_security order by gid;`
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })
})

app.post("/food_security/getedit", (req, res) => {
    const data = req.body;
    let id_date = data.id_date
    let sql = `select *from public.food_security where id_date ='${id_date}'`;
    eec.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})
app.post("/food_security/delete", (req, res) => {
    const data = req.body;
    let id_date = data.id_date
    let sql = `DELETE FROM food_security WHERE id_date = '${id_date}'`;
    eec.query(sql).then(r => {
        res.status(200).json({
            data: "success"
        })
    })
})

app.post("/food_security/update", async (req, res) => {
    const { data } = req.body;
    // console.log(data)
    data.map(async (x) => {
        let d;
        for (d in x) {
            // console.log(d)
            if (x[d] !== '' && d !== 'id_date' && d !== 'geom') {
                let sql = `UPDATE food_security SET ${d} ='${x[d]}' WHERE id_date ='${x.id_date}';`
                // console.log(sql);
                eec.query(sql)
            }
        }
    })
    res.status(200).json({
        data: "success"
    })
})
/////////////ท่องเที่ยว////////////////
app.get("/form_travel/getgeom", async (req, res) => {
    const { typess, prov } = req.body;
    // console.log(data)
    let sql = `select *,ST_AsGeojson(geom) as geojson,TO_CHAR(datetimes, 'DD-MM-YYYY') as datetimes from travel_eac order by gid desc`
    // console.log(y)
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})
app.post("/form_travel/getgeom/tp", async (req, res) => {
    const { typess, prov } = req.body;
    // console.log(data)
    let sql
    if (prov == 'ทุกจังหวัด') {
        sql = `select *,ST_AsGeojson(geom) as geojson from travel_eac where typess ='${typess}' order by gid desc`
    } else {
        sql = `select *,ST_AsGeojson(geom) as geojson from travel_eac where typess ='${typess}' and prov_tn ='${prov}' order by gid desc`
    }
    // console.log(y)
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})
app.get("/form_travel/getdata", async (req, res) => {
    const { id_user } = req.body;
    // console.log(data)
    let sql = `select * from travel_eac order by gid desc`
    // console.log(y)
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})
app.post("/form_travel/getdata/id", async (req, res) => {
    const { id_data } = req.body;
    // console.log(id_data)
    let sql = `select * from travel_eac where id_data='${id_data}'`
    // console.log(y)
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})
app.post("/travel_eac/form/save", async (req, res) => {
    const { data } = req.body;
    // console.log(data)
    data.map(async (x) => {
        let y = `INSERT INTO travel_eac (id_data) VALUES ('${x.id_data}');`
        // console.log(y)
        await eec.query(y)
        let d;
        for (d in x) {
            // console.log(d)
            if (x[d] !== '' && d !== 'id_data' && d !== 'geom') {
                let sql = `UPDATE travel_eac SET ${d} ='${x[d]}' WHERE id_data ='${x.id_data}';`
                // console.log(sql);
                eec.query(sql)
            }
        }
        if (x.geom !== "") {
            let sql = `UPDATE travel_eac SET geom = ST_GeomfromGeoJSON('${JSON.stringify(x.geom)}')
                                WHERE id_data ='${x.id_data}';`
            // console.log(sql);
            eec.query(sql)
        }
    })
    res.status(200).json({
        data: "success"
    })
})
/////////////ข้อมูลตำบล อำเภอ จังหวัด ในประเทศไทย/////////////////////
app.get("/th/province", async (req, res) => {
    const { staid } = req.body
    let sql = `select DISTINCT pv_idn,pv_code,pv_tn,pv_en from intoth order by pv_tn ASC;`
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })
})
app.post("/th/amphoe", async (req, res) => {
    const { pv_code } = req.body;
    let sql = `select DISTINCT ap_idn,ap_code,ap_tn,ap_en from intoth where pv_code = '${pv_code}' order by ap_tn ASC;`
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})
app.post("/th/tambon", async (req, res) => {
    const { ap_idn } = req.body;
    let sql = `select DISTINCT tb_idn,tb_code,tb_tn,tb_en from intoth where ap_idn = '${ap_idn}' order by tb_tn ASC;`
    eec.query(sql, (e, r) => {
        // console.log(r.rows);
        res.status(200).json({
            data: r.rows
        })
    })

})

module.exports = app;