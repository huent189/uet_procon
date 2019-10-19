var runloop = false;
var host = "http://112.137.129.202:3000/"
var username = "team4";
var password = "0%6q&XuF";
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoidGVhbTQiLCJpYXQiOjE1NzE0NDkzOTcsImV4cCI6MTU3MTQ1NjU5N30.FIqyBt-Q04lPkNlPvBDZOrurRu0mQmtqFXmTTtTgMmk";
var matchID = 0;
var myID;
var mine;
var competitor;
var tiled;
var submitData = [];
var curTurn = -1;
var matchTime = { "start": 0, "duration": 0, "turn": 0, "totalDuration": 0 }
function drawingMatch(data) {
    let height = data.height;
    let width = data.width;
    let point = data.points;
    tiled = data.tiled;
    console.log(tiled);

    if (data.teams[0].teamID === myID) {
        mine = data.teams[0];
        competitor = data.teams[1];
    } else {
        mine = data.teams[1];
        competitor = data.teams[0];
    }
    $("#myPoint").html(mine.areaPoint + mine.tilePoint);
    $("#competitorPoint").html(competitor.areaPoint + competitor.tilePoint);
    matchTime.start = data.startedAtUnixTime;
    html = "";
    for (let i = 1; i <= height; i++) {
        let tr = "";
        for (let j = 1; j <= width; j++) {
            let td = "";
            td = "<td id='" + j + "_" + i + "'>" + point[i - 1][j - 1] + "</td>";
            tr = tr + td;
        }
        html = html + "<tr>" + tr + "</tr>";
    }
    document.getElementById("table").innerHTML = html;
    for (let i = 1; i <= height; i++) {

        for (let j = 1; j <= width; j++) {
            if (tiled[i - 1][j - 1] === mine.teamID) {
                document.getElementById(j + "_" + i).style.background = "yellow";
            }
            if (tiled[i - 1][j - 1] === competitor.teamID) {
                document.getElementById(j + "_" + i).style.background = "red";
            }
        }
    }
    for (let i = 0; i < mine.agents.length; i++) {
        let x = mine.agents[i].x;
        let y = mine.agents[i].y;
        // submitData[mine.agents[i].agentID] = {"agentID" : mine.agents[i].agentID, "dx" : 0, "dy" : 0, "type" : "stay"};
        document.getElementById(x + "_" + y).style.background = "lightskyblue";
        document.getElementById(x + "_" + y).setAttribute('onclick', 'selectAgent(' + mine.agents[i].agentID + ',' + x + ',' + y + ')');
        document.getElementById(x + "_" + y).setAttribute('agent', mine.agents[i].agentID);
    }
    for (let i = 0; i < competitor.agents.length; i++) {
        let x = competitor.agents[i].x;
        let y = competitor.agents[i].y;
        document.getElementById(x + "_" + y).style.background = "greenyellow";
    }
}
function selectAgent(id, x, y) {
    console.log("Agent selected" + id);
    document.getElementById(x + "_" + y).style.background = "#e52efa";
    for (let dx = -1; dx < 2; dx++) {
        for (let dy = -1; dy < 2; dy++) {
            var curX = x + dx;
            var curY = y + dy;
            if (curX < 1 || curY < 1 || curX > tiled[0].length || curY > tiled.length) {
                continue;
            }
            if (tiled[curY - 1][curX - 1] == competitor.teamID) {
                document.getElementById(curX + "_" + curY).setAttribute('onclick', 'action(' + id + ',' + dx + ',' + dy + ', "remove")');
            } else if ((dx != 0 || dy != 0) && (tiled[curY - 1][curX - 1] != mine.teamID))  {
                document.getElementById(curX + "_" + curY).setAttribute('onclick', 'action(' + id + ',' + dx + ',' + dy + ', "move")');
            }
        }

    }
}
function action(agentID, dx, dy, type) {
    $("[agent = '" + agentID + "']").css("background", "yellow");
    $("[onclick *= 'action(" + agentID + "," + dx + "," + dy + "']").css("background", "lightskyblue");
    submitData.push({ "agentID": agentID, "dx": dx, "dy": dy, "type": type });
}
function run() {
    var jsonobj = $('#jsonSend').val();
    console.log(jsonobj);
    $.ajax({
        url: host + "matches/" + matchID + "/action",
        type: 'post',
        // dataType: 'json',
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        data: jsonobj,
        success: function (data) {
            console.log(data);
        },
        statusCode: {
            401: function () {
                alert("token sai hoặc không tồn tại");
            },
            400: function (xhr) {
                alert("InvalidMatches  or TooEarly: ");
                // log(xhr.responseText);
            },

        }

    });
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
    // console.log(info);
    $("#matchInformation > p").html(info);
    // matchID = data[0].id;
    matchTime.duration = data[0].turnMillis;
    matchTime.totalDuration = matchTime.duration + data[0].intervalMillis + 1;
}
async function login() {
    await $.post( host + 'api/auth/account-login',
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
        url: host + 'matches',
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
        url: host + "matches/" + matchID,
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
                // log(xhr.responseText);
            },

        }
    });
    return "update_ok";
}
function getMatch(id) {
    matchID = id;
    getCurrentMatchInfo();

}
$(document).ready(function () {
    login().then(function () {
        // console.log(token);
        getMatchBefore(token);
    });
    setInterval(function () {
        if (runloop && matchTime.start != 0) {
            curTurn = Math.floor((Date.now() - matchTime.start) / matchTime.totalDuration);
            if (matchTime.turn != curTurn) {
                console.log(Date.now());
                console.log(getCurrentMatchInfo());
                matchTime.turn = curTurn;
                $("#turnNumber").html(matchTime.turn);
            }
            $("#remainingTime").html((matchTime.duration - (Date.now() - matchTime.start - matchTime.turn * matchTime.totalDuration)) / 1000);
        }
    }, 1000);
});
function toJson() {
    var tmp = { "actions": submitData }
    var tmp2 = JSON.stringify(tmp);
    $('#jsonSend').val(tmp2);
    submitData = [];
}