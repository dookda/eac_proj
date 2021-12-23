let ustoken = sessionStorage.getItem("ustoken")

const url = 'http://localhost:3000';
// const url = "https://eec-onep.online:3700";

let refreshPage = () => {
    location.reload(true);
}

let loadUser = (data) => {
    console.log(data);
    data.map(i => {
        document.getElementById("user").innerHTML = `<div class="form-group">
        <i class="fas fa-users"></i>&nbsp;
        <label>ชื่อผู้ใช้:</label>
        <span id="usrname"></span>
    </div>`
    })

}

let gotoLogin = () => {
    location.href = "./../login/index.html";
}

$(document).ready(() => {
    axios.post(url + '/eac-auth/getalluser', { userid: ustoken }).then(r => {
        r.data.data == "invalid" ? gotoLogin() : loadUser(r.data.data);
    })
});


