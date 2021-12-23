// const url = 'http://localhost:3000';
const url = "https://eec-onep.online:3700";
let userid;
let dataurl;
let geom = "";
// let gps1;


let gotoReportAdmin = () => {
    location.href = "./../../form_organizeV2/report_admin/index.html";
}

let refreshPage = () => {
    location.reload(true);
}

let checkUser = () => {

}

let login = () => {
    let data = {
        usrname: document.getElementById("username").value,
        pass: document.getElementById("password").value
    }

    axios.post(url + "/eac-auth/getuser", data).then(r => {
        console.log(r);
        if (r.data.data == 'invalid') {
            document.getElementById("passwarning").innerHTML = `ชื่อหรือรหัสผ่านผิด`;
        } else {
            document.getElementById("passwarning").innerHTML = "";
            sessionStorage.setItem("ustoken", r.data.data)
            gotoReportAdmin()
        }
    })
}





