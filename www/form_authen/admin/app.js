let ustoken = sessionStorage.getItem("ustoken")

// const url = 'http://localhost:3000';
const url = "https://eec-onep.online:3700";

let refreshPage = () => {
    location.reload(true);
}

let deleteUser = (userid) => {
    axios.post(url + '/eac-auth/deleteuser', { userid }).then(r => {
        r.data.data == "success" ? loadData() : null;
    })
}

let loadUser = (data) => {
    document.getElementById("user").innerHTML = "";
    data.map(i => {
        document.getElementById("user").innerHTML += `<div class="form-group">
            <i class="fas fa-users"></i>&nbsp;<label>ชื่อผู้ใช้: ${i.usrname}</label>&nbsp;&nbsp;<label>token: ${i.userid}</label>&nbsp;
            <div class="pull-right"><button class="btn btn-warning" onclick="deleteUser('${i.userid}')"><i class="fas fa-trash"></i>&nbsp;ลบข้อมูล</button>
            </div></div>`
    })
}

let gotoLogin = () => {
    location.href = "./../login/index.html";
}

let loadData = () => {
    axios.post(url + '/eac-auth/getalluser', { userid: ustoken }).then(r => {
        r.data.data == "invalid" ? gotoLogin() : loadUser(r.data.data);
    })
}

$(document).ready(() => {
    loadData()
});




