const dict = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
const messages = ["I believe the Raspberry Pi has burst into flames.", "What do you mean the fileserver has a power budget? This isn't FNAF, right?", "HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HA-*drowning intensifies*", "I think corporate is allergic to fun.", "Some malign spirit has taken Hatsune Miku hostage and left corrupted 1s and 0s all over.", "I said I didn't want you to push yourself too hard, didn't I?", "The server's reliability is based on Mafuyu's mental wellbeing. She ain't doing so well, apparently."];
var buffer = [];
var buffer2 = [];

function getRandomInteger(list) {
    return Math.floor(Math.random() * list.length);
}

document.getElementById("errorText").innerText = messages[getRandomInteger(messages)];
for (let i = 0; i < 2; i++) {
    buffer.push(dict[getRandomInteger(dict)]);
    document.getElementById("task1").innerText = buffer.join(""); 
}
for (let i = 0; i < 4; i++) {
    let count = (i % 2 === 0) ? 8 : 1;
    buffer = [];
    for (let j = 0; j < count; j++) {
        buffer.push(dict[getRandomInteger(dict)]);
    }
    if (i % 2 === 0) {
        buffer2.push("0x".concat(buffer.join("")));
    } else {
        buffer2.push("0x0000000".concat(buffer[0]));
    }
}
document.getElementById("task2").innerText = buffer2.join(", ");
