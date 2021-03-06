const { response } = require('./utils')

// From https://stackoverflow.com/a/1349426
function generateRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
   return result;
}

module.exports = function (socket) {
    const loop = setInterval(() => {
        if (socket.disconnected) {
            clearInterval(loop)
            return
        }

        const timeout = setTimeout(() => {
            socket.emit('heartbeat:timeout', { error: 'Heartbeat was requested but no answers were received.' })
            socket.disconnect()
        }, 60 * 1000)
        const question = generateRandomString(16)

        socket.once('heartbeat:answer', (requestId, answer) => {
            console.log('Received ', answer)
            console.log('Asked for', question)
            console.log(typeof answer)
            clearTimeout(timeout)
            
            if (answer !== question) {
                socket.emit('heartbeat:answer', response(requestId, 500, { error: 'Answer was wrong.' }))
                socket.disconnect()
            } else {
                socket.emit('heartbeat:answer', response(requestId, 200))
            }
        })

        socket.emit('heartbeat:request', {
            msg: 'Answer is requested.', 
            timeLeft: 10 * 1000,
            question: question
        })
    }, 2 * 1000)
}