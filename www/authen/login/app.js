// const url = 'http://localhost:3000';
const url = "https://eec-onep.online:3700";
let userid;
let dataurl;
let geom = "";
// let gps1;


let gotoList = () => {
    location.href = "./../report/index.html";
}

let refreshPage = () => {
    location.reload(true);
}

let checkUser = () => {
    axios.post(url + "/getuserver",)
}

let login = () => {
    let usrname = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    console.log(username, password);
}





