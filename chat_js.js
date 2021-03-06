(function() {
    var Message;
    Message = function(arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function(_this) {
            return function() {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function() {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };

    $(function() {

        var socket = new WebSocket("ws://34.201.250.165:7890");
        var to_id = "Mom";
        var api_key = null;
        var is_first = true;

        socket.onopen = function(){
            console.log("OPENED:", socket.readyState);
            socket.send(JSON.stringify({
                "register": true, 
                "device_name": "Karthik Ragunath"
            }));
        };

        socket.onclose = function(){
            console.log("CLOSED:", socket.readyState);
        };

        socket.onmessage = function(msg){
            if (is_first)
            {
                console.log(msg);
                const sent_msg = msg.data;
                console.log(sent_msg);
                const msg_toks = sent_msg.split(" ");
                api_key = msg_toks[msg_toks.length - 1];
                console.log("API Key is: " + api_key);
                getMessage(sent_msg);
                is_first = false;
            }
            else
            {
                const sent_msg = msg.data;
                if(sent_msg.split(" ").includes("AutomatedResponse:"))
                {
                    getMessage(sent_msg);
                }
                else
                {
                    msg_split  = sent_msg.split(":");
                    if(msg_split.length != 1)
                    {
                        msg_tokens = msg_split[0].split("from ");
                        if(msg_tokens.length != 1)
                        {
                            msg_sender_id = msg_tokens[1];
                            to_id = msg_sender_id;
                        }
                    }
                    getMessage(sent_msg);
                }
            }
        };

        var getMessageText, message_side, sendMessage;
        message_side = 'right';

        getMessageText = function() {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };

        getMessage = function(text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = 'left';
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };

        sendMessage = function(text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = 'right';
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();

            var json_obj = null;
            if(text.split(" ").includes("NLP:"))
            {
                msg_split = text.split("NLP:")
                json_obj = {"auth_key": api_key, "question": msg_split[1]}
            }
            else
            {
                json_obj = {"auth_key": api_key, "to_id": to_id, "message": text}
            }
            const msg_string = JSON.stringify(json_obj)
            socket.send(msg_string);
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);

        };

        $('.send_message').click(function(e) {
            return sendMessage(getMessageText());
        });
        $('.message_input').keyup(function(e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });
    });
}.call(this));
