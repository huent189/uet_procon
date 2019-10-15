var username;
var password;
var token = "";
var matchID = 0;
var myID;
var mine;
var competitor;
var agentSelected = false;
var tiled;
function drawingMatch(data) {
    let height = data.height;
    let width = data.width;
    let point = data.points;
    tiled = data.tiled;
    if(data.teams[0].teamID === myID){
        mine = data.teams[0];
        competitor = data.teams[1];
    } else{
        mine = data.teams[1];
        competitor = data.teams[0];
    }
    html = "";
    for (let i = 1; i <= height; i++) {
        let tr = "";
        for (let j = 1; j <= width; j++) {
            let td = "";
            td = "<td id='" + i + "_" + j + "'>" + point[i - 1][j - 1] + "</td>";
            tr = tr + td;
        }
        html = html + "<tr>" + tr + "</tr>";
    }
    document.getElementById("table").innerHTML = html;
    for (let i = 1; i <= height; i++) {

        for (let j = 1; j <= width; j++) {
            if (tiled[i - 1][j - 1] === mine.teamID) {
                document.getElementById(i + "_" + j).style.background = "yellow";
            }
            if (tiled[i - 1][j - 1] === competitor.teamID) {
                document.getElementById(i + "_" + j).style.background = "red";
            }
        }
    }
    for (let i = 0; i < mine.agents.length; i++) {
        let x = mine.agents[i].x;
        let y = mine.agents[i].y;
        document.getElementById(x + "_" + y).style.background = "lightskyblue";
        document.getElementById(x + "_" + y).setAttribute('onclick', 'selectAgent(' + mine.agents[i].agentID + ',' + x + ',' + y + ')');
    }
    for (let i = 0; i < competitor.agents.length; i++) {
        let x = competitor.agents[i].x;
        let y = competitor.agents[i].y;
        document.getElementById(x + "_" + y).style.background = "greenyellow";
    }
}
function K_click(x, y) {
    for (let i = 0; i < mine.agents.length; i++) {
        let x1 = mine.agents[i].x;
        let y1 = mine.agents[i].y;
        let tmp = Math.abs(x1 - x) + Math.abs(y1 - y);
        if (tmp <= 1) {
            document.getElementById(x + "_" + y).style.background = "#e52efa";
            document.getElementById(x + "_" + y).setAttribute('onclick', 'D_click(' + x + ',' + y + ')');
        }
        else {
            if (Math.abs(x1 - x) === 1 && Math.abs(y1 - y) === 1) {
                document.getElementById(x + "_" + y).style.background = "#e52efa";
                document.getElementById(x + "_" + y).setAttribute('onclick', 'D_click(' + x + ',' + y + ')');
            }
        }

    }

}
function selectAgent(id, x, y) {
    console.log("Agent selected");
    document.getElementById(x + "_" + y).style.background = "#e52efa";
    agentSelected = true;
    for (let dx = -1; dx < 2; dx++) {
        for(let dy = -1; dy < 2; dy++){
            var curX = x + dx;
            var curY = y + dy;
            if(curX < 1 || curY < 1 || curX > tiled.width || curY > tiled.height) {
                continue;
            }
            if(tiled[curX - 1][curY - 1] === competitor.teamID){
                document.getElementById(curX + "_" + curY).setAttribute('onclick', 'action(' + id + ',' + dx + ',' + dy + ', "remove")');
            } else if (dx === 0 && dy === 0){
                document.getElementById(curX + "_" + curY).setAttribute('onclick', 'action(' + id + ',' + dx + ',' + dy + ', "stay")');
            } else {
                document.getElementById(curX + "_" + curY).setAttribute('onclick', 'action(' + id + ',' + dx + ',' + dy + ', "move")');
            }
        }
        
    }
}
function action(agentID, dx, dy, type) {
    if(agentSelected){
        $.ajax({
            url: "http://sv-procon.uet.vnu.edu.vn:3000/matches/" + matchID + "/action",
            type: 'post',
            // dataType: 'json',
            data: {
                token : token,
                actions : {
                    agentID : agentID,
                    dx : dx,
                    dy : dy,
                    type : type 
                }
            },
            success: function (data) {
                console.log(data);
            },
            statusCode: {
                401: function () {
                    alert("token sai hoặc không tồn tại");
                },
                400: function (xhr) {
                    alert("InvalidMatches  or TooEarly: ");
                    log(xhr.responseText);
                },
    
            }
            
        });
    }
    agentSelected = false;
}
function D_click(x, y) {
    document.getElementById(x + "_" + y).style.background = "white";
    document.getElementById(x + "_" + y).setAttribute('onclick', 'K_click(' + x + ',' + y + ')');
}
function processMatchInfoBefore(data) {
    info = "";
    myID = data[0].teamID;
    for (let i = 0; i < data.length; i++) {
        info += "ID trận đấu: " + data[i].id;
        info += "<br> Đối thủ: " + data[i].matchTo;
        info += "<br> Thời gian giữa hailượt chơi: " + data[i].intervalMillis;
        info += "<br> Thời gian mỗi lượt chơi: " + data[i].turnMillis;
        info += "<br> Số lượt chơi: " + data[i].turns;
        info += "<br>--------<br>";
        $("#matchInformation").append('<button onclick="getMatch(' + data[i].id + ')">GET MATCH - ' + data[i].id + '</button>');
    }
    console.log(info);
    $("#matchInformation > p").html(info);
    matchID = data[0].id;

}
async function login() {
    await $.post('http://sv-procon.uet.vnu.edu.vn:3000/api/auth/account-login',
        {
            user_name: username,
            user_pass: password
        },
        function (data, status, xhr) {
            token = $('#exampleFormControlTextarea5', data).html();

        }, "html"
    );
}
function getMatchBefore(t) {
    $.ajax({
        url: 'http://sv-procon.uet.vnu.edu.vn:3000/matches',
        type: 'get',
        dataType: 'json',
        data: {
            token: t
        },
        success: function (data) {
            processMatchInfoBefore(data);
        },
        statusCode: {
            401: function () {
                alert("InvalidToken");
            }
        }
    });
}
function getCurrentMatchInfo() {
    $.ajax({
        url: "http://sv-procon.uet.vnu.edu.vn:3000/matches/" + matchID,
        type: 'get',
        dataType: 'json',
        data: {
            token: token
        },
        success: function (gameData) {
            console.log(gameData);
            drawingMatch(gameData);
        },
        statusCode: {
            401: function () {
                alert("token sai hoặc không tồn tại");
            },
            400: function (xhr) {
                alert("InvalidMatches  or TooEarly: ");
                log(xhr.responseText);
            },

        }
    });
}
function getMatch(id) {
    matchID = id;
    getCurrentMatchInfo();

}
$(document).ready(function () {
    login().then(function () {
        console.log(token);
        getMatchBefore(token);
    })
});
