var UHTRP_Paging = {};
(function() {
    var MAX_RECIPIENTS = 10;
    var MAX_CHARACTERS = 240;
    var PAGERS_DB = 'res/pagers.json';
    var CGI_ENDPOINT = 'https://www.usamobility.net/cgi-bin/wwwpage.exe';
    var num_recipients = 0;
    var num_characters = 0;
    var pagers = {};
    var selected_list = {};
    var unselected_list = {};
    var unselected_input = {};
    var message_text = {};
    var character_notice = {};
    var send_button = {};
    var pager_form = {};
    var submitted_list = [];
    var cur_recipient = 0;
    var initialized = false;

    this.initialize = function(obj) {
        if (!initialized) {
            /* cache DOM elements */
            selected_list = $('#selected-recipients');
            unselected_list = $('#unselected-recipients');
            unselected_input = unselected_list.prev('form').find('input');
            message_text = $('#message');
            character_notice = $('#charcount');
            send_button = $('#send');
            pager_form = $('<form method="post" action="' + CGI_ENDPOINT + '" target="pageresult"><input type="hidden" name="PIN"><input type="hidden" name="MSSG"><input type="hidden" name="Q1" value="0"></form>');
            $('#pagingpage').append(pager_form.hide());
            $('#pagingpage').append($('<iframe name="pageresult"></iframe>'));


            $.getJSON(PAGERS_DB).done(function(data) {
                pagers = data;
                $.each(pagers, function(key, val) {
                    var txt = pagers[key] + ' [' + key.slice(-4) + ']';
                    var li = $('<li id="' + key + '" data-icon="plus" data-filtertext="' + key + ' ' + val + '"><a href="#">' + txt + '</a></li>');
                    li.click(obj, obj.add_recipient);
                    unselected_list.append(li);
                });
                unselected_list.listview('refresh');
                unselected_input.on('input', obj, obj.numeric_recipient).trigger('input');
            });
            message_text.on('input', obj, obj.count_characters).trigger('input');
            send_button.click(obj, obj.page_request);
            initialized = true;
        }
    };

    var toggle_send_button = function() {
        if ((num_recipients > 0) && (num_characters > 0))
            send_button.removeClass('ui-disabled');
        else
            send_button.addClass('ui-disabled');
    };

    this.add_recipient = function(evt) {
        var key = $(this).attr('id').toString();
        var txt = (key in pagers) ? pagers[key] + ' [' + key.slice(-4) + ']' : key;
        var li = $('<li id="' + key + '" data-icon="delete"><a href="#">' + txt + '</a></li>');
        li.click(evt.data, evt.data.remove_recipient);
        $(this).remove();
        unselected_list.listview('refresh');
        selected_list.append(li).listview('refresh');
        unselected_input.val('').trigger('change');
        num_recipients = selected_list.children('li').length;
        if (num_recipients >= MAX_RECIPIENTS)
            unselected_input.val('Maximum number of recipients reached!').textinput('disable');
        toggle_send_button();
        evt.preventDefault();
    };

    this.remove_recipient = function(evt) {
        var key = $(this).attr('id').toString();
        $('#' + key).remove();
        selected_list.listview('refresh');
        if (key in pagers) {
            var txt = pagers[key] + ' [' + key.slice(-4) + ']';
            var li = $('<li id="' + key + '" data-icon="plus" data-filtertext="' + key + ' ' + pagers[key] + '"><a href="#">' + txt + '</a></li>');
            li.click(evt.data, evt.data.add_recipient);
            unselected_list.append(li).listview('refresh');
        }
        num_recipients = selected_list.children('li').length;
        unselected_input.val('').textinput('enable').trigger('change');
        toggle_send_button();
        evt.preventDefault();
    };

    this.numeric_recipient = function(evt) {
        var tendigit = /^\d{10}$/;
        var sevendigit = /^\d{7}$/;
        var fourdigit = /^\d{4}$/;
        var key = null;

        if (fourdigit.test($(this).val()))
            key = '808577' + $(this).val();
        else if (sevendigit.test($(this).val()))
            key = '808' + $(this).val();
        else if (tendigit.test($(this).val()))
            key = $(this).val().toString();

        if ((key !== null) && ($('#' + key).length == 0)) {
            var txt = key;
            var li = $('<li id="' + key + '" class="numrec" data-icon="plus" data-filtertext="' + key + '"><a href="#">' + txt + '</a></li>');
            li.click(evt.data, evt.data.add_recipient);
            unselected_list.append(li);
        } else {
            $('.numrec').remove();
        }

        unselected_list.listview('refresh');
    }

    this.count_characters = function(evt) {
        $(this).val($(this).val().substring(0, MAX_CHARACTERS));
        num_characters = $(this).val().length;
        var rem = MAX_CHARACTERS - num_characters;
        var red = Math.round(255 * num_characters / MAX_CHARACTERS);
        character_notice.text(rem + ' characters remaining').css('color', 'rgb(' + red + ',0,0)');
        toggle_send_button();
    };

    this.page_request = function(evt) {
    /*  Ideally, would use wctp here, but POSTing raw data requires
        XHR which is limited by the same-origin policy. Using a proxy
        to bridge would require trusting the server with the message.
        POSTing to the CGI repeatedly for each recipient foregoes
        error-checking, but requires only a trusted client.           */

        submitted_list = [];
        cur_recipient = 0;
        $.each(selected_list.children('li'), function(idx, val) {
            submitted_list.push(val.attr('id'));
        });
        post_page();
//        pager_form.submit();
    };

    var post_page = function() {
        if (cur_recipient < submitted_list.length) {
            var key = submitted_list[cur_recipient].toString();
            var txt = (key in pagers) ? pagers[key] + ' [' + key.slice(-4) + ']' : key;
            $('#current-recipient').text(txt);
            setTimeout(post_page, 2000);
        } else {
            submitted_list = [];
            cur_recipient = 0;
        }
    };
}).apply(UHTRP_Paging);


$(document).delegate('#pagingpage', 'pageinit', function() {
    UHTRP_Paging.initialize(UHTRP_Paging);
});

