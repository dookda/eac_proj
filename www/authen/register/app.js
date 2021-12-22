// const url = 'http://localhost:3000';
const url = "https://eec-onep.online:3700";
let userid;
let dataurl;
let geom = "";
// let gps1;

let gotoLogin = () => {
    location.href = "./../login/index.html";
}

let refreshPage = () => {
    location.reload(true);
}

let register = () => {
    let data = {
        data: {
            usrname: document.getElementById("username").value,
            pass: document.getElementById("password").value
        }
    }

    axios.post(url + "/eac-auth/insertuser", data).then(r => {
        console.log(r);
        if (r.data.data == "success") {
            gotoLogin()
        }
    })
}

document.getElementById("regisBtn").disabled = true;
let checkPassword = () => {
    let pass1 = document.getElementById("password").value;
    let pass2 = document.getElementById("password2").value;

    if (pass1 !== pass2) {
        document.getElementById("passwarning").innerHTML = `โปรดระบุรหัสผ่านให้เหมือนกัน`;
        document.getElementById("regisBtn").disabled = true;
    } else {
        document.getElementById("passwarning").innerHTML = "";
        document.getElementById("regisBtn").disabled = false;
    }
}



